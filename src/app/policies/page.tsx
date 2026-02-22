import Logo from "@/components/Icons/Logo";
import Link from 'next/link'

export default function PoliciesPage() {
  const updatedAt = "22 de fevereiro de 2026";

  return (
    <main className="mx-auto max-w-4xl px-6 py-12 text-gray-900 dark:text-white">
 <div className="flex flex-col sm:flex-row ls:flex-row xl:flex-row  justify-center sm:justify-start ls:justify-start xl:justify-start sm:items-start xl:items-start ls:items-start items-center gap-4 mb-10">
       <div className="after:content relative mb-5 flex h-auto flex-col  gap-4 overflow-hidden rounded-lg bg-white/10 px-6 pb-16 text-center text-white shadow-highlight after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight lg:pt-0">
                          <div className="absolute inset-0 flex items-center justify-center opacity-20">
                              <span className="absolute left-0 right-0 bottom-0 h-auto bg-gradient-to-b from-black/0 via-black to-black"></span>
                          </div>
                          <Logo className="relative  drop-shadow-xl" />
                          <h1 className="text-base font-bold uppercase tracking-widest">
                              Issacar Imagens
                          </h1>
        
                          <Link
                              className="pointer z-10 mt-6 rounded-lg border border-white bg-white px-3 py-2 text-sm font-semibold text-black transition hover:bg-white/10 hover:text-white md:mt-4"
                              href="/"
                          >
                              Voltar 
                          </Link>
                      </div>
      <div>
 <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight ">Politicas da Plataforma</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-white">Ultima atualizacao: {updatedAt}</p>
      </header>

      <section className="space-y-6">
        <article>
          <h2 className="text-xl font-semibold">1. Politica de Privacidade</h2>
          <p className="mt-2 leading-7 text-gray-700 dark:text-gray-300">
            Coletamos apenas os dados necessarios para operar a plataforma, como informacoes de conta,
            preferencias e dados tecnicos de uso. Esses dados sao utilizados para autenticacao, melhoria do
            servico, seguranca e comunicacao relacionada a conta.
          </p>
        </article>

        <article>
          <h2 className="text-xl font-semibold">2. Uso das Informacoes</h2>
          <p className="mt-2 leading-7 text-gray-700 dark:text-gray-300">
            As informacoes coletadas nao sao vendidas. O compartilhamento ocorre somente quando necessario para
            prestacao do servico (por exemplo, provedores de infraestrutura), por obrigacao legal, ou mediante
            consentimento explicito do usuario.
          </p>
        </article>

        <article>
          <h2 className="text-xl font-semibold">3. Politica de Cookies</h2>
          <p className="mt-2 leading-7 text-gray-700 dark:text-gray-300">
            Utilizamos cookies e tecnologias similares para manter sessoes ativas, lembrar preferencias e
            analisar desempenho. Voce pode ajustar o uso de cookies no navegador, ciente de que algumas funcoes
            podem ser afetadas.
          </p>
        </article>

        <article>
          <h2 className="text-xl font-semibold">4. Retencao e Seguranca de Dados</h2>
          <p className="mt-2 leading-7 text-gray-700 dark:text-gray-300">
            Mantemos os dados pelo periodo necessario para cumprir finalidades operacionais e legais. Aplicamos
            medidas tecnicas e organizacionais para reduzir riscos de acesso nao autorizado, perda ou alteracao
            indevida.
          </p>
        </article>

        <article>
          <h2 className="text-xl font-semibold">5. Direitos do Usuario</h2>
          <p className="mt-2 leading-7 text-gray-700 dark:text-gray-300">
            Voce pode solicitar acesso, correcao, portabilidade ou exclusao dos seus dados, conforme legislacao
            aplicavel. Tambem pode revogar consentimentos concedidos anteriormente, quando cabivel.
          </p>
        </article>

        <article>
          <h2 className="text-xl font-semibold">6. Responsabilidades de Uso</h2>
          <p className="mt-2 leading-7 text-gray-700 dark:text-gray-300">
            O usuario se compromete a utilizar a plataforma de forma licita, sem violar direitos de terceiros
            ou comprometer seguranca e estabilidade do servico. Conteudos enviados sao de responsabilidade do
            proprio usuario.
          </p>
        </article>

        <article>
          <h2 className="text-xl font-semibold">7. Alteracoes desta Politica</h2>
          <p className="mt-2 leading-7 text-gray-700 dark:text-gray-300">
            Esta politica pode ser atualizada periodicamente para refletir mudancas legais, tecnicas ou
            operacionais. Recomendamos revisar esta pagina com regularidade.
          </p>
        </article>

        <article>
          <h2 className="text-xl font-semibold">8. Contato</h2>
          <p className="mt-2 leading-7 text-gray-700 dark:text-gray-300">
            Para duvidas ou solicitacoes relacionadas a estas politicas, entre em contato pelo canal oficial de
            suporte informado na plataforma.
          </p>
        </article>
      </section>
      </div>
     
      </div>
    </main>
  );
}
