import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { collection, doc, setDoc, getDoc, updateDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import { 
  checkRateLimit, 
  recordAttempt, 
  logSecurityEvent, 
  SecurityEvents,
  sanitizeInput,
  validatePasswordStrength 
} from './securityService';

export const authService = {
  // Login com proteção OWASP
  async login(email, password) {
    // Sanitizar entrada
    const sanitizedEmail = sanitizeInput(email, { maxLength: 255 });
    const sanitizedPassword = sanitizeInput(password, { maxLength: 128 });
    
    // Verificar rate limit
    const rateLimit = checkRateLimit(sanitizedEmail, 'login', 5, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      logSecurityEvent(SecurityEvents.RATE_LIMIT_EXCEEDED, {
        email: sanitizedEmail,
        waitTime: rateLimit.waitTime
      });
      throw new Error(rateLimit.message || 'Muitas tentativas de login. Aguarde alguns minutos.');
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, sanitizedEmail, sanitizedPassword);
      const user = userCredential.user;
      
      // Registrar sucesso
      recordAttempt(sanitizedEmail, 'login', true);
      logSecurityEvent(SecurityEvents.LOGIN_SUCCESS, {
        userId: user.uid,
        email: sanitizedEmail
      });
      
      // Buscar nome de guerra do Firestore
      let nomeGuerra = user.displayName || 'Usuário';
      let role = 'user';
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          nomeGuerra = data.nomeGuerra || user.displayName || 'Usuário';
          role = data.role || 'user';
        }
      } catch (error) {
        console.error('Erro ao buscar nome de guerra:', error);
      }
      
      return {
        uid: user.uid,
        email: user.email,
        name: nomeGuerra,
        nomeGuerra: nomeGuerra,
        role
      };
    } catch (error) {
      // Registrar falha
      recordAttempt(sanitizedEmail, 'login', false);
      logSecurityEvent(SecurityEvents.LOGIN_FAILURE, {
        email: sanitizedEmail,
        error: error.code || error.message
      });
      console.error('Erro no login:', error);
      throw error;
    }
  },

  // Registro com proteção OWASP
  async register(email, password, name, nomeGuerra) {
    // Sanitizar entradas
    const sanitizedEmail = sanitizeInput(email, { maxLength: 255 });
    const sanitizedName = sanitizeInput(name, { maxLength: 100 });
    const sanitizedNomeGuerra = sanitizeInput(nomeGuerra, { maxLength: 50 });
    
    // Validar força da senha
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      logSecurityEvent(SecurityEvents.INVALID_INPUT, {
        type: 'weak_password',
        email: sanitizedEmail
      });
      throw new Error(`Senha fraca: ${passwordValidation.errors.join(', ')}`);
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, sanitizedEmail, password);
      const user = userCredential.user;
      
      // Atualizar perfil com nome completo (sanitizado)
      await updateProfile(user, {
        displayName: sanitizedName
      });

      // Salvar nome de guerra no Firestore (sanitizado)
      try {
        await setDoc(doc(db, 'users', user.uid), {
          nomeCompleto: sanitizedName,
          nomeGuerra: sanitizedNomeGuerra,
          email: sanitizedEmail,
          role: 'user',
          createdAt: serverTimestamp()
        }, { merge: true });
        
        logSecurityEvent(SecurityEvents.LOGIN_SUCCESS, {
          userId: user.uid,
          email: sanitizedEmail,
          action: 'register'
        });
      } catch (error) {
        console.error('Erro ao salvar nome de guerra no Firestore:', error);
      }

      return {
        uid: user.uid,
        email: user.email,
        name: sanitizedNomeGuerra,
        nomeGuerra: sanitizedNomeGuerra,
        role: 'user'
      };
    } catch (error) {
      logSecurityEvent(SecurityEvents.INVALID_INPUT, {
        type: 'register_error',
        email: sanitizedEmail,
        error: error.code || error.message
      });
      console.error('Erro no registro:', error);
      throw error;
    }
  },

  // Logout com logging
  async logout() {
    try {
      const currentUser = auth.currentUser;
      await signOut(auth);
      
      if (currentUser) {
        logSecurityEvent(SecurityEvents.LOGOUT, {
          userId: currentUser.uid
        });
      }
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    }
  },

  // Observar mudanças de autenticação
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  },

  // Usuário atual
  getCurrentUser() {
    return auth.currentUser;
  },

  // Obter nome de guerra do usuário atual
  async getNomeGuerra() {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return 'Usuário Anônimo';

      // Buscar do Firestore
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        return userDoc.data().nomeGuerra || currentUser.displayName || currentUser.email || 'Usuário Anônimo';
      }

      // Fallback para localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.nomeGuerra || user.name || currentUser.displayName || currentUser.email || 'Usuário Anônimo';
      }

      return currentUser.displayName || currentUser.email || 'Usuário Anônimo';
    } catch (error) {
      console.error('Erro ao buscar nome de guerra:', error);
      // Fallback
      const currentUser = auth.currentUser;
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.nomeGuerra || user.name || 'Usuário Anônimo';
      }
      return currentUser?.displayName || currentUser?.email || 'Usuário Anônimo';
    }
  },

  // Trocar senha com validação OWASP
  async changePassword(currentPassword, newPassword) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Validar força da nova senha
      const passwordValidation = validatePasswordStrength(newPassword);
      if (!passwordValidation.valid) {
        logSecurityEvent(SecurityEvents.INVALID_INPUT, {
          type: 'weak_password_change',
          userId: user.uid
        });
        throw new Error(`Senha fraca: ${passwordValidation.errors.join(', ')}`);
      }

      // Reautenticar o usuário
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Atualizar a senha
      await updatePassword(user, newPassword);
      
      logSecurityEvent(SecurityEvents.PASSWORD_CHANGE, {
        userId: user.uid
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao trocar senha:', error);
      throw error;
    }
  },

  // Atualizar nome de guerra de um usuário pelo email
  async updateNomeGuerraByEmail(email, nomeGuerra) {
    try {
      const currentUser = auth.currentUser;
      
      // Se o usuário está autenticado e o email corresponde, usar o UID diretamente
      if (currentUser && currentUser.email === email) {
        try {
          // Primeiro tentar atualizar se o documento já existe
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            // Documento existe, apenas atualizar
            await updateDoc(userDocRef, {
              nomeGuerra: nomeGuerra,
              updatedAt: new Date().toISOString()
            });
          } else {
            // Documento não existe, criar com merge
            await setDoc(userDocRef, {
              nomeGuerra: nomeGuerra,
              email: email,
              nomeCompleto: currentUser.displayName || email,
              role: 'user',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }, { merge: true });
          }
          
          // Atualizar também o localStorage
          const userData = localStorage.getItem('user');
          if (userData) {
            const userObj = JSON.parse(userData);
            userObj.nomeGuerra = nomeGuerra;
            userObj.name = nomeGuerra;
            localStorage.setItem('user', JSON.stringify(userObj));
          }
          
          return true;
        } catch (error) {
          console.error('Erro ao atualizar usando UID:', error);
          throw error;
        }
      }
      
      // Se não é o usuário atual, tentar buscar por email no Firestore
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('Usuário não encontrado no Firestore. Faça login para atualizar.');
      }
      
      // Atualizar todos os documentos encontrados (deve ser apenas um)
      const updatePromises = querySnapshot.docs.map(docSnapshot => {
        const docData = docSnapshot.data();
        return updateDoc(doc(db, 'users', docSnapshot.id), {
          nomeGuerra: nomeGuerra,
          updatedAt: new Date().toISOString(),
          role: docData.role || 'user'
        });
      });
      
      await Promise.all(updatePromises);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar nome de guerra:', error);
      throw error;
    }
  }
};
