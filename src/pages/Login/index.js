import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTheme } from '../../contexts/ThemeContext';
import { authService } from '../../services/authService';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepLogged, setKeepLogged] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se o usuário já está logado (apenas uma vez no mount)
    const checkAuth = async () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        navigate('/', { replace: true });
      }
    };

    checkAuth();
  }, []); // Executar apenas uma vez no mount

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Preencha todos os campos!');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres!');
      return;
    }

    try {
      const user = await authService.login(email, password);
      
      // Salvar dados do usuário no localStorage para compatibilidade
      localStorage.setItem('user', JSON.stringify({
        ...user,
        role: user.role || 'user'
      }));
      
      toast.success('Login realizado com sucesso!');
      
      // Usar replace para evitar loop e adicionar pequeno delay
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 100);
    } catch (error) {
      console.error('Erro no login:', error);
      
      if (error.code === 'auth/user-not-found') {
        toast.error('Usuário não encontrado!');
      } else if (error.code === 'auth/wrong-password') {
        toast.error('Senha incorreta!');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Email inválido!');
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('⚠️ Muitas tentativas! Aguarde 5 minutos antes de tentar novamente.');
      } else if (error.code === 'auth/network-request-failed') {
        toast.error('Erro de conexão. Verifique sua internet.');
      } else {
        toast.error('Erro ao fazer login. Tente novamente.');
      }
    }
  };

  const handleCreateAccount = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-cb-background text-cb-text-primary transition-colors duration-300">
      <div className="relative flex min-h-screen flex-col lg:flex-row w-full overflow-x-hidden">
        {/* Background accent */}
        <div
          className="pointer-events-none absolute inset-0 opacity-40 blur-3xl dark:opacity-30"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(circle at 20% 20%, rgba(34,197,94,0.28), transparent 45%), radial-gradient(circle at 80% 10%, rgba(16,162,74,0.24), transparent 40%)',
          }}
        />

        {/* Login Form */}
        <div className="relative flex flex-1 items-center justify-center px-6 py-14 sm:px-10 lg:px-16">
          <div className="w-full max-w-md space-y-8 rounded-2xl border border-cb-border bg-cb-card p-8 shadow-lg shadow-black/10 dark:shadow-black/40">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-semibold uppercase tracking-wider text-cb-text-muted">
                  Bem-vindo ao CLIP
                </div>
                <h1 className="mt-2 text-3xl font-semibold text-cb-text-primary sm:text-4xl">
                  Entrar
                </h1>
                <p className="mt-2 text-sm text-cb-text-secondary">
                  Digite seu email e senha para fazer login
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  toggleTheme();
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-cb-border bg-cb-input text-cb-text-secondary transition-colors duration-200 hover:text-cb-text-primary"
                title={isDarkMode ? 'Alternar para modo claro' : 'Alternar para modo escuro'}
              >
                <span className="sr-only">Alternar tema</span>
                {isDarkMode ? (
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 3v2.25" />
                    <path d="M12 18.75V21" />
                    <path d="M4.219 4.219l1.59 1.59" />
                    <path d="M18.19 18.19l1.59 1.59" />
                    <path d="M3 12h2.25" />
                    <path d="M18.75 12H21" />
                    <path d="M5.81 18.19l-1.59 1.59" />
                    <path d="M19.78 4.22l-1.59 1.59" />
                    <path d="M8.25 12a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0z" />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.354 15.354A9 9 0 018.646 3.646 7.5 7.5 0 0020.354 15.354z" />
                  </svg>
                )}
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-cb-text-primary"
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-2 w-full rounded-lg border border-cb-border bg-cb-input px-4 py-3 text-sm text-cb-text-primary placeholder:text-cb-text-muted focus:border-cb-primary focus:outline-none focus:ring-2 focus:ring-cb-primary focus:ring-offset-2 focus:ring-offset-cb-background"
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-cb-text-primary"
                  >
                    Senha *
                  </label>
                  <input
                    type="password"
                    id="password"
                    placeholder="Mín. 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="mt-2 w-full rounded-lg border border-cb-border bg-cb-input px-4 py-3 text-sm text-cb-text-primary placeholder:text-cb-text-muted focus:border-cb-primary focus:outline-none focus:ring-2 focus:ring-cb-primary focus:ring-offset-2 focus:ring-offset-cb-background"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-cb-text-secondary">
                  <input
                    type="checkbox"
                    checked={keepLogged}
                    onChange={(e) => setKeepLogged(e.target.checked)}
                    className="h-4 w-4 rounded border-cb-border bg-cb-input text-cb-primary focus:ring-cb-primary"
                  />
                  Manter-me conectado
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-cb-primary transition-colors duration-200 hover:text-cb-primary-dark"
                >
                  Esqueceu a senha?
                </Link>
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cb-primary px-4 py-3 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-px hover:bg-cb-primary-dark focus:outline-none focus:ring-2 focus:ring-cb-primary focus:ring-offset-2 focus:ring-offset-cb-background"
              >
                Entrar
              </button>
            </form>

            <div className="rounded-xl border border-cb-border bg-cb-input/60 px-4 py-3 text-center text-sm text-cb-text-secondary">
              Ainda não tem uma conta?{' '}
              <button
                type="button"
                onClick={handleCreateAccount}
                className="font-semibold text-cb-primary transition-colors duration-200 hover:text-cb-primary-dark"
              >
                Criar conta
              </button>
            </div>
          </div>
        </div>

        {/* Right side brand panel */}
        <div className="hidden lg:flex relative flex-1 items-center justify-center overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#101f32] to-[#1A2235] px-8 py-14 text-white lg:min-h-full">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.3),transparent_55%)] opacity-70" />
          <div className="relative z-10 flex max-w-lg flex-col items-center text-center">
            <span className="rounded-full border border-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
              Sistema Administrativo
            </span>
            <h2 className="mt-6 text-4xl font-semibold leading-tight sm:text-5xl">
              CLIP
            </h2>
            <p className="mt-4 text-base text-white/80 sm:text-lg">
              Controle de Lacres e IP com gestão moderna, intuitiva e segura para sua organização.
            </p>
            <div className="mt-10 grid w-full gap-4 sm:grid-cols-2">
              {[
                {
                  title: 'Gestão Completa',
                  description: 'Monitore lacres, IPs e histórico de auditoria em tempo real.',
                },
                {
                  title: 'Alertas Inteligentes',
                  description: 'Receba notificações imediatas sobre conflitos e inconsistências.',
                },
                {
                  title: 'Segurança',
                  description: 'Firebase Authentication e regras de acesso ajustadas às suas necessidades.',
                },
                {
                  title: 'Interface Responsiva',
                  description: 'Experiência consistente em desktops, tablets e smartphones.',
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl border border-white/15 bg-white/5 p-4 text-left backdrop-blur-sm transition-all duration-200 hover:border-white/30 hover:bg-white/10"
                >
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-xs text-white/80">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;