import { useEffect, useState } from 'react'
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import BrandLogo from '../../components/shared/BrandLogo'
import { authService } from '../../services/authService'
import { useAuthStore } from '../../stores/authStore'

export default function LoginPage() {
  const strStorageEmail = 'strLoginEmail'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [bolMostrarSenha, setBolMostrarSenha] = useState(false)
  const [bolLembrarDispositivo, setBolLembrarDispositivo] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    const strEmailSalvo = localStorage.getItem(strStorageEmail)
    if (strEmailSalvo) {
      setEmail(strEmailSalvo)
      setBolLembrarDispositivo(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { user, token } = await authService.login(email, password)

      if (bolLembrarDispositivo) {
        localStorage.setItem(strStorageEmail, email)
      } else {
        localStorage.removeItem(strStorageEmail)
      }

      setAuth(user, token)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-[#102f56] via-brand-primary to-[#163f6e]">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.12),transparent_40%)]" />

      <div className="relative min-h-screen w-full max-w-[1280px] mx-auto grid grid-cols-1 xl:grid-cols-[1fr_280px] items-center gap-6 px-4 sm:px-6 lg:px-10 py-8">
        <div className="w-full flex justify-center">
          <div className="w-full max-w-[430px]">
            <div className="bg-white rounded-2xl shadow-2xl border border-white/60 overflow-hidden">
              <div className="px-7 sm:px-8 pt-8 pb-6">
                <div className="text-center mb-6">
                  <BrandLogo variant="login" />
                  <p className="mt-3 text-[10px] font-semibold tracking-[0.24em] text-brand-secondary uppercase">
                    Intelligent Fleet
                  </p>
                </div>

                <div className="text-center mb-6">
                  <h1 className="text-3xl font-extrabold tracking-tight text-brand-primary">Bem-vindo de volta</h1>
                  <p className="text-sm text-gray-500 mt-1">Acesse sua central de comando</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm border border-red-100">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                      E-mail corporativo
                    </label>
                    <div className="relative">
                      <Mail
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-[#f2f5ff] border border-[#e7ebf7] rounded-xl focus:ring-2 focus:ring-brand-secondary/40 focus:border-brand-secondary/50 outline-none text-gray-800"
                        placeholder="exemplo@gefther.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                        Senha
                      </label>
                      <button
                        type="button"
                        onClick={() => window.open('mailto:suporte@gefther.com.br?subject=Recuperação%20de%20senha', '_self')}
                        className="text-xs font-semibold text-brand-primary hover:text-brand-secondary transition-colors"
                      >
                        Esqueceu a senha?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                      <input
                        type={bolMostrarSenha ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 bg-[#f2f5ff] border border-[#e7ebf7] rounded-xl focus:ring-2 focus:ring-brand-secondary/40 focus:border-brand-secondary/50 outline-none text-gray-800"
                        placeholder="********"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setBolMostrarSenha((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-primary transition-colors"
                        aria-label={bolMostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                      >
                        {bolMostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 pt-1 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={bolLembrarDispositivo}
                      onChange={(e) => setBolLembrarDispositivo(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-brand-secondary focus:ring-brand-secondary"
                    />
                    Lembrar deste dispositivo
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-1 py-3.5 bg-brand-secondary text-white rounded-xl font-bold tracking-[0.18em] uppercase hover:bg-brand-secondary-hover disabled:opacity-60 transition-colors shadow-lg shadow-brand-secondary/20"
                  >
                    {loading ? 'Entrando...' : 'Entrar'}
                  </button>
                </form>
              </div>

              <div className="px-7 sm:px-8 py-4 text-center border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Não possui acesso?{' '}
                  <button
                    type="button"
                    onClick={() => window.open('mailto:suporte@gefther.com.br?subject=Solicitação%20de%20acesso', '_self')}
                    className="font-semibold text-brand-secondary hover:text-brand-secondary-hover"
                  >
                    Solicite à sua gerência
                  </button>
                </p>
              </div>

              <div className="px-7 sm:px-8 py-3 bg-[#f7f8fc] border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500 font-semibold uppercase tracking-wide">
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck size={12} /> Conexão segura AES-256
                </span>
                <span>v4.2.0-stable</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-5 text-[11px] uppercase tracking-wide text-white/55 font-medium">
              <a
                href="https://gefther.com.br/termos"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white/80 transition-colors"
              >
                Termos de uso
              </a>
              <a
                href="https://gefther.com.br/privacidade"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white/80 transition-colors"
              >
                Privacidade
              </a>
              <a
                href="mailto:suporte@gefther.com.br?subject=Suporte%20técnico"
                className="hover:text-white/80 transition-colors"
              >
                Suporte técnico
              </a>
            </div>
          </div>
        </div>

        <div className="hidden xl:flex items-end justify-end h-full pb-6">
          <div className="w-full max-w-[270px] rounded-2xl border border-white/10 bg-white/6 backdrop-blur-sm p-6 text-white shadow-xl">
            <div className="w-10 h-10 rounded-lg bg-brand-secondary-muted text-brand-secondary flex items-center justify-center mb-4">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-2xl font-bold tracking-tight">Visão total da frota</h3>
            <p className="text-sm text-white/80 mt-3 leading-relaxed">
              Monitore desempenho, custos e manutenção preventiva em uma única interface inteligente.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
