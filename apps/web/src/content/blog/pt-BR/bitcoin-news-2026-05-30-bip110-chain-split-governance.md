---
title: "BIP-110: A Proposta Que Pode Dividir o Bitcoin por Causa de Ordinals e Espaço em Bloco"
date: "2026-05-30"
excerpt: "Uma polémica proposta de melhoria do Bitcoin — BIP-110 — pretende bloquear Ordinals, Runes e dados arbitrários de ocuparem permanentemente o espaço em bloco do Bitcoin. Se ativar, os nós atualizados rejeitarão blocos com inscrições de dados. Os veteranos Adam Back e Jameson Lopp chamaram-lhe 'imprudente'. Aqui está o que o debate realmente significa."
image: "/images/blog/bitcoin-bip110-governance-2026-05-30.jpg"
---

## Introdução

O debate técnico mais controverso do Bitcoin em 2026 não é sobre preço, ETFs ou adoção soberana. É sobre para que serve fundamentalmente o espaço em bloco do Bitcoin.

A **BIP-110** — uma Proposta de Melhoria do Bitcoin com janela de ativação prevista para **agosto de 2026** — limitaria o tamanho dos scripts de saída de transações, tornando efetivamente impossível inscrever dados arbitrários (Ordinals, Runes, Stamps, imagens, texto) na blockchain do Bitcoin. Se adotada sem problemas, a mudança reduziria o inchaço do tamanho dos blocos e manteria as taxas de transação mais baixas para transferências financeiras padrão.

Se adotada de forma precipitada, arrisca algo que o Bitcoin evitou em toda a sua história de 17 anos: uma **divisão da cadeia** — onde duas versões incompatíveis do Bitcoin funcionam simultaneamente, dividindo mineradores, operadores de nós, exchanges e detentores em facções concorrentes.

Algumas das vozes técnicas mais respeitadas do Bitcoin estão a avisar que a BIP-110 está exatamente nesse caminho.

![Código Bitcoin num ecrã representando o debate de governança BIP-110 e o risco de divisão da cadeia](/images/blog/bitcoin-bip110-governance-2026-05-30.jpg)

---

## O Que a BIP-110 Realmente Propõe

A proposta tem um objetivo técnico direto. Iria:

* **Limitar a maioria dos scriptPubKeys de saída de transações a 34 bytes** — suficiente para um endereço P2PKH, P2SH ou P2WPKH padrão, mas não para os scripts de centenas de bytes usados por inscrições de Ordinals e Runes
* **Permitir saídas OP_RETURN até 83 bytes** — preservando um canal controlado para timestamping e ancoragem de dados leve sem permitir grandes inscrições
* **Ativar usando sinalização bit 4**, exigindo **55% de suporte dos mineradores** ao longo de períodos de dificuldade de 2.016 blocos — um limiar mais baixo do que os 95% historicamente usados por soft forks como o Taproot

O objetivo declarado é defender o espaço em bloco do Bitcoin do que os proponentes chamam de "spam": inscrições de imagens e ficheiros de texto em Ordinals, emissões de tokens Rune e transações Stamp que incorporam dados em saídas não gastas. Estes casos de uso chegaram a elevar as taxas de transação acima de 30 dólares, excluindo transferências BTC padrão.

---

## Por Que Isto Vai Além de Uma Correção Técnica

O problema não é a ideia — é o mecanismo.

### Política de Retransmissão vs. Regras de Consenso

O Bitcoin tem duas camadas distintas de regras:

* **A política de retransmissão** é o que os nós *voluntariamente* concordam em propagar entre si. É informal, configurável e não determina o que é válido. O Bitcoin Knots, por exemplo, já tem políticas de retransmissão que filtram inscrições de Ordinals — mas blocos contendo inscrições ainda são válidos e aceites por toda a rede.
* **As regras de consenso** são o que os nós usam para decidir se um bloco é *válido em absoluto*. Estas regras são a base do Bitcoin. Quebrá-las é a definição de um fork.

A BIP-110 move o conflito da camada de retransmissão para a camada de consenso. Com a BIP-110, um nó atualizado **rejeitaria como inválido** qualquer bloco contendo scripts que excedam os novos limites de bytes. Um nó não atualizado aceitaria o mesmo bloco como válido.

Essa lacuna — nós atualizados rejeitando blocos que os não atualizados aceitam — é precisamente a condição técnica para uma divisão da cadeia.

### O Problema de Sinalização dos Mineradores

Para que um soft fork ative de forma limpa, os mineradores precisam de sinalizar suporte. O modelo clássico (usado para o Taproot em 2021) exigiu mais de 90% de suporte dos mineradores ao longo de um período de sinalização de 2.016 blocos, dando a todo o ecossistema tempo para atualizar antes de quaisquer novas regras entrarem em vigor.

A BIP-110 usa um **limiar de 55%** — presumivelmente porque os autores esperam que os mineradores favoráveis a Ordinals bloqueiem limiares mais altos. Mas 55% não é um piso seguro para evitar divisão da cadeia. Se 45% do hash rate estiver a executar software que não impõe os novos limites de saída, esses mineradores continuarão a produzir blocos com inscrições que os 55% consideram inválidos.

O resultado: duas cadeias concorrentes, cada uma com hash rate real, atividade económica real e reivindicações concorrentes ao nome "Bitcoin". Esse cenário não é teórico — é aproximadamente o que aconteceu em agosto de 2017 quando o Bitcoin Cash se separou do Bitcoin.

---

## O Que os Críticos Estão a Dizer

Duas das vozes mais tecnicamente credíveis do Bitcoin saíram fortemente contra a proposta.

### Adam Back (CEO da Blockstream)

Adam Back — inventor do Hashcash, citado no whitepaper original do Bitcoin como referência de prova de trabalho — chamou à BIP-110 de **"imprudente"**.

A sua objeção técnica específica: as restrições são **contornáveis**. As inscrições de Ordinals podem ser reestruturadas para caber dentro dos limites de bytes enquanto ainda codificam os mesmos dados, apenas de forma menos eficiente. A proposta, na visão de Back, só consegue prejudicar o desenvolvimento legítimo do protocolo (esquemas multi-sig, extensões Tapscript, tipos de canais Lightning) enquanto deixa os inscritores de dados determinados com soluções alternativas diretas.

> *"O dano à inovação não é contornável. O problema de inscrição de dados é."*

A preocupação mais profunda de Back é filosófica: a força do Bitcoin historicamente vem de **regras neutras e previsíveis** e compatibilidade retroativa. Uma mudança que torna tipos de transação anteriormente válidos inválidos — mesmo os não padronizados — estabelece um precedente de que quem controla a sinalização dos mineradores controla o que o Bitcoin permite. Isso é um Bitcoin diferente do que tem operado desde 2009.

### Jameson Lopp (CTO da Casa)

Jameson Lopp — um dos engenheiros de segurança e protocolo mais respeitados no ecossistema Bitcoin — descreveu a BIP-110 como **"imprudente e condenada ao fracasso"**.

O aviso de Lopp foca-se na coordenação. Atualizações limpas do protocolo requerem apoio quase unânime de mineradores, operadores de nós, exchanges e carteiras antes da ativação. O limiar de 55% da BIP-110 tenta forçar a adoção contra as objeções de uma grande minoria técnica. Na avaliação de Lopp, a cura é pior do que a doença:

> *"Um soft fork mal coordenado não apenas falha — falha causando danos. Cada exchange que tem de decidir qual cadeia seguir, cada carteira que tem de escolher quais regras implementar, cada utilizador que está incerto se a sua transação é válida — essa incerteza é o custo."*

---

## A Divisão Filosófica por Trás da Técnica

O debate da BIP-110 é fundamentalmente sobre uma questão que tem estado a fermentar no Bitcoin desde 2022: **para que serve o espaço em bloco do Bitcoin?**

Dois campos formaram-se:

**O campo "Bitcoin é dinheiro"** argumenta que o espaço em bloco é um recurso finito que deve ser reservado para transações financeiras — transferências de valor peer-to-peer, aberturas e fechamentos de canais Lightning, configurações de custódia multisig. As inscrições são um efeito secundário de uma brecha técnica (o desconto de testemunha SegWit) que Satoshi nunca pretendeu e que eleva as taxas para todos.

**O campo "Bitcoin é infraestrutura neutra"** argumenta que as regras do Bitcoin nunca discriminaram entre tipos de transação com base no seu propósito. Uma transação válida é uma transação válida. Se alguém quer pagar a taxa de rede para inscrever um JPEG, é seu direito. O mercado — através das taxas — determina quais transações valem economicamente. Mudar as regras para o impedir é censura ao nível do protocolo.

A BIP-110 é o "campo do dinheiro" tentando codificar a sua preferência nas regras de consenso. O "campo da infraestrutura" está a resistir precisamente porque acredita que a mudança estabelece um precedente que futuras maiorias poderiam usar para restringir outros tipos de transação atualmente válidos.

---

## O Que Uma Divisão da Cadeia Realmente Significaria

Se a BIP-110 ativar com coordenação insuficiente de hash rate — um cenário que parece plausível dado os dados atuais de sinalização dos mineradores — as consequências práticas são graves:

* **As exchanges enfrentam uma escolha de Sofia.** Binance, Coinbase, Kraken e todas as outras principais plataformas teriam de decidir qual cadeia chamar "Bitcoin" e qual listar como outra coisa. Nenhuma escolha é simples.
* **O software de carteira divide-se.** Carteiras de hardware, móveis e de desktop precisariam de atualizações de software de emergência para lidar com o fork — sem garantia de que todos os fornecedores de carteiras respondam uniformemente.
* **Os detentores de Ordinals enfrentam incerteza.** Milhões de dólares em Ordinals, Runes e Stamps inscritos antes do fork só seriam "válidos" na cadeia não-BIP-110. O seu estado na cadeia BIP-110 seria indefinido.
* **A descoberta de preço do novo Bitcoin torna-se caótica.** Ambas as cadeias negociariam contra USDT e entre si até o mercado determinar um vencedor. O processo poderia demorar semanas e atrairia enorme especulação vendedora.

Cada fork histórico do Bitcoin acabou por resolver-se — mas "eventualmente" significou meses de perturbação do mercado, confusão nas exchanges e danos reputacionais para o ecossistema mais amplo.

---

## Como as Mudanças de Protocolo do Bitcoin Deveriam Funcionar

Para contexto: o Bitcoin já navegou em atualizações de protocolo controversas antes, e a comunidade desenvolveu princípios arduamente conquistados dessas experiências.

* **Segregated Witness (2017):** Levou anos de debate, um fork ameaçado (Bitcoin Cash) e um acordo de última hora entre mineradores, desenvolvedores e empresas antes de ativar com mais de 95% de sinalização. O resultado foi retrocompatível e a rede emergiu intacta.
* **Taproot (2021):** Uma atualização muito menos controversa que ainda exigiu sinalização quase universal e uma revisão de design de dois anos antes da ativação.

A lição de ambos é que as atualizações bem-sucedidas do Bitcoin requerem **consenso esmagador antes da ativação**, não regra de maioria simples. Um limiar de ativação de 55% é um afastamento desse modelo — e as pessoas que mais avisam sobre isso são as que viveram as guerras de fork de 2017 em primeira mão.

---

## Onde as Coisas Estão Agora

No final de maio de 2026:

* **O suporte de nós** para a BIP-110 cresceu principalmente através do Bitcoin Knots, uma implementação de nó alternativa mantida pelo desenvolvedor Luke Dashjr, que também é um dos principais defensores da BIP-110
* **A sinalização dos mineradores** permanece muito abaixo do limiar de 55% necessário para ativação na janela de agosto
* **A oposição** de desenvolvedores proeminentes — incluindo Back e Lopp — intensificou-se nas últimas duas semanas à medida que a proposta ganhou atenção mainstream
* **Nenhuma exchange ou fornecedor de carteiras principal** comprometeu-se publicamente a aplicar as novas regras da BIP-110

A janela de ativação de agosto ainda é teoricamente possível, mas a trajetória atual de sinalização torna a ativação limpa até essa data improvável. O que é menos claro é o que acontece se os proponentes da proposta avançarem de qualquer forma.

---

## Conclusão

A BIP-110 é uma tentativa genuína de resolver um problema genuíno. Os dados que as inscrições de Ordinals e Runes colocam na blockchain do Bitcoin consomem espaço em bloco que de outra forma transportaria transações financeiras. As taxas subiram. A experiência de utilizador das transferências Bitcoin padrão degradou-se.

Mas o mecanismo importa tanto quanto o objetivo. Um soft fork do Bitcoin que ativa contra a oposição ativa de uma grande minoria técnica, com um limiar de mineradores abaixo de 60%, num ambiente de governança onde as principais exchanges e fornecedores de carteiras não se comprometeram com as novas regras, não é uma solução — é um problema diferente.

O Bitcoin que sobreviveu 17 anos sem uma divisão da cadeia fê-lo estabelecendo um limiar extremamente elevado para o consenso antes de mudar as regras pelas quais todos têm de jogar. A janela de agosto da BIP-110 testará se esse limiar ainda é o padrão, ou se uma minoria técnica motivada pode agora mover a camada de consenso com uma simples maioria.

A resposta, e a sinalização de hash rate nos próximos sessenta dias, dir-nos-á muito sobre como é realmente o modelo de governança do Bitcoin em 2026.

Fontes:
- [Bitcoin's BIP-110 Proposal Could Trigger a Chain Split, Warn Critics — Cointelegraph](https://cointelegraph.com/news/bitcoin-bip110-chain-split-ordinals-governance-2026)
- [Adam Back Calls BIP-110 'Reckless' as Miner Signaling Lags — The Block](https://www.theblock.co/post/bitcoin-bip110-adam-back-reckless-miner-signaling-2026)
- [Jameson Lopp: BIP-110 Is 'Reckless and Doomed to Fail' — Bitcoin Magazine](https://bitcoinmagazine.com/technical/jameson-lopp-bip110-reckless-doomed-to-fail-2026)
- [BIP-110: Restricting Output Script Sizes to Combat Data Inscriptions — GitHub Bitcoin BIPs](https://github.com/bitcoin/bips)
