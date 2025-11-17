import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTheme } from '../../contexts/ThemeContext';
import { authService } from '../../services/authService';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const Register = () => {
  const [name, setName] = useState('');
  const [nomeGuerra, setNomeGuerra] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se o usuário já está logado
    const unsubscribe = authService.onAuthStateChanged((user) => {
      if (user) {
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!name || !nomeGuerra || !email || !password || !confirmPassword) {
      toast.error('Preencha todos os campos!');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem!');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres!');
      return;
    }

    if (name.length < 2) {
      toast.error('O nome deve ter pelo menos 2 caracteres!');
      return;
    }

    if (nomeGuerra.length < 2) {
      toast.error('O nome de guerra deve ter pelo menos 2 caracteres!');
      return;
    }

    setIsLoading(true);

    try {
      const user = await authService.register(email, password, name, nomeGuerra);
      
      // Salvar dados do usuário no localStorage para compatibilidade
      localStorage.setItem('user', JSON.stringify({
        ...user,
        nomeGuerra: nomeGuerra,
        role: user.role || 'user'
      }));
      
      toast.success('Conta criada com sucesso!');
      navigate('/');
    } catch (error) {
      console.error('Erro no registro:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Este email já está em uso!');
      } else if (error.code === 'auth/weak-password') {
        toast.error('A senha é muito fraca!');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Email inválido!');
      } else {
        toast.error('Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-cb-text-primary transition-colors duration-300 dark:bg-cb-background">
      <div className="relative flex min-h-screen flex-col lg:flex-row">
        {/* Background accent */}
        <div
          className="pointer-events-none absolute inset-0 opacity-40 blur-3xl dark:opacity-30"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(circle at 25% 25%, rgba(34,197,94,0.28), transparent 50%), radial-gradient(circle at 75% 15%, rgba(16,162,74,0.24), transparent 40%)',
          }}
        />

        {/* Left content: branding */}
        <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#101f32] to-[#1A2235] px-8 py-14 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.35),transparent_60%)] opacity-70" />
          <div className="relative z-10 flex max-w-xl flex-col gap-8 text-center lg:text-left">
            <div>
              <span className="rounded-full border border-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                Nova conta CLIP
              </span>
              <h1 className="mt-6 text-4xl font-semibold leading-tight sm:text-5xl">
                Modernize o controle de ativos da sua unidade
              </h1>
              <p className="mt-4 text-base text-white/80 sm:text-lg">
                Crie uma conta para acessar todos os recursos de gestão de lacres, IPs,
                auditorias e alertas inteligentes do CLIP.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: 'Cadastro completo',
                  description: 'Inclua dados pessoais e nome de guerra para personalizar suas ações no sistema.',
                },
                {
                  title: 'Permissões seguras',
                  description: 'Autenticação Firebase e regras de acesso revisadas para proteger os dados.',
                },
                {
                  title: 'Integração total',
                  description: 'Conecte-se com dashboards, históricos, alertas e administração em tempo real.',
                },
                {
                  title: 'Visão colaborativa',
                  description: 'Defina responsáveis e seções, acompanhando as mudanças com auditoria detalhada.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-white/15 bg-white/5 p-4 text-left backdrop-blur-sm transition-all duration-200 hover:border-white/30 hover:bg-white/10"
                >
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs text-white/80">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right content: form */}
        <div className="relative flex flex-1 items-center justify-center px-6 py-14 sm:px-10 lg:px-16">
          <div className="w-full max-w-lg space-y-8 rounded-2xl border border-cb-border bg-cb-card p-8 shadow-lg shadow-black/10 dark:shadow-black/40">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-semibold uppercase tracking-wider text-cb-text-muted">
                  Criar nova conta
                </div>
                <h2 className="mt-2 text-3xl font-semibold text-cb-text-primary sm:text-4xl">
                  Cadastre-se
                </h2>
                <p className="mt-2 text-sm text-cb-text-secondary">
                  Preencha seus dados para começar a usar o CLIP
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

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-cb-text-primary">
                    Nome completo *
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Digite seu nome completo"
                    required
                    disabled={isLoading}
                    className="mt-2 w-full rounded-lg border border-cb-border bg-cb-input px-4 py-3 text-sm text-cb-text-primary placeholder:text-cb-text-muted focus:border-cb-primary focus:outline-none focus:ring-2 focus:ring-cb-primary focus:ring-offset-2 focus:ring-offset-cb-background disabled:opacity-60"
                  />
                </div>
                <div>
                  <label
                    htmlFor="nomeGuerra"
                    className="block text-sm font-medium text-cb-text-primary"
                  >
                    Nome de guerra *
                  </label>
                  <input
                    id="nomeGuerra"
                    type="text"
                    value={nomeGuerra}
                    onChange={(e) => setNomeGuerra(e.target.value)}
                    placeholder="Digite seu nome de guerra"
                    required
                    disabled={isLoading}
                    className="mt-2 w-full rounded-lg border border-cb-border bg-cb-input px-4 py-3 text-sm text-cb-text-primary placeholder:text-cb-text-muted focus:border-cb-primary focus:outline-none focus:ring-2 focus:ring-cb-primary focus:ring-offset-2 focus:ring-offset-cb-background disabled:opacity-60"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-cb-text-primary">
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    disabled={isLoading}
                    className="mt-2 w-full rounded-lg border border-cb-border bg-cb-input px-4 py-3 text-sm text-cb-text-primary placeholder:text-cb-text-muted focus:border-cb-primary focus:outline-none focus:ring-2 focus:ring-cb-primary focus:ring-offset-2 focus:ring-offset-cb-background disabled:opacity-60"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-cb-text-primary"
                    >
                      Senha *
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mín. 6 caracteres"
                      required
                      disabled={isLoading}
                      className="mt-2 w-full rounded-lg border border-cb-border bg-cb-input px-4 py-3 text-sm text-cb-text-primary placeholder:text-cb-text-muted focus:border-cb-primary focus:outline-none focus:ring-2 focus:ring-cb-primary focus:ring-offset-2 focus:ring-offset-cb-background disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-cb-text-primary"
                    >
                      Confirmar senha *
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a senha"
                      required
                      disabled={isLoading}
                      className="mt-2 w-full rounded-lg border border-cb-border bg-cb-input px-4 py-3 text-sm text-cb-text-primary placeholder:text-cb-text-muted focus:border-cb-primary focus:outline-none focus:ring-2 focus:ring-cb-primary focus:ring-offset-2 focus:ring-offset-cb-background disabled:opacity-60"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={classNames(
                  "inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-cb-primary focus:ring-offset-2 focus:ring-offset-cb-background",
                  isLoading
                    ? "bg-cb-text-muted cursor-not-allowed"
                    : "bg-cb-primary hover:-translate-y-px hover:bg-cb-primary-dark"
                )}
              >
                {isLoading ? 'Criando conta...' : 'Criar conta'}
              </button>
            </form>

            <div className="rounded-xl border border-cb-border bg-cb-input/60 px-4 py-3 text-center text-sm text-cb-text-secondary">
              Já possui uma conta?{' '}
              <Link
                to="/login"
                className="font-semibold text-cb-primary transition-colors duration-200 hover:text-cb-primary-dark"
              >
                Fazer login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;