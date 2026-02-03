# Exemplos de conteúdo por matéria e nível

Bodies prontos para **POST** `{{baseUrl}}/api/contents`.  
Substitua `<uuid-categoria-portugues>`, `<uuid-categoria-matematica>` e `<uuid-categoria-historia>` pelos UUIDs reais da tabela **Category** (Prisma Studio ou GET `/api/users` → professor com a matéria em `teacherSubjects`).

**grade:** use a série desejada (`6`, `7`, `8`, `9`, `1EM`, `2EM`, `3EM`).  
**level:** `1` (introdutório), `2` (intermediário), `3` (avançado). Conteúdo de **reforço** usa `"level": "reforco"`.

---

## Português — Nível 1

```json
{
  "title": "Classes de palavras: substantivo e adjetivo",
  "contentText": "As palavras podem ser agrupadas em classes conforme a função que exercem na oração. O substantivo é a palavra que nomeia seres, lugares, sentimentos e ideias. O adjetivo é a palavra que caracteriza o substantivo, atribuindo-lhe qualidade, estado ou modo. Exemplo: 'A casa antiga' — 'casa' é substantivo; 'antiga' é adjetivo.",
  "categoryId": "<uuid-categoria-portugues>",
  "grade": "7",
  "level": "1",
  "topics": [
    {
      "title": "Substantivo",
      "content": "Substantivos podem ser próprios (nomeiam um ser específico: Maria, Brasil) ou comuns (nomeiam um tipo: cidade, país). Também podem ser concretos ou abstratos."
    },
    {
      "title": "Adjetivo",
      "content": "O adjetivo concorda em gênero e número com o substantivo: 'livros interessantes', 'história longa'."
    }
  ],
  "glossary": [
    {
      "word": "substantivo",
      "definition": "Palavra que nomeia seres, coisas, lugares, ideias ou sentimentos"
    },
    {
      "word": "adjetivo",
      "definition": "Palavra que caracteriza o substantivo, indicando qualidade, estado ou modo"
    }
  ],
  "tags": ["classes de palavras", "substantivo", "adjetivo", "gramática"]
}
```

---

## Português — Nível 2

```json
{
  "title": "Verbos: tempo, modo e conjugação",
  "contentText": "O verbo é a palavra que indica ação, estado ou fenômeno. Ele varia em tempo (presente, passado, futuro), modo (indicativo, subjuntivo, imperativo) e em pessoa e número. A conjugação verbal segue padrões conforme a terminação do infinitivo: -ar (1ª conjugação), -er (2ª), -ir (3ª). Exemplo: 'Eu estudo' (presente do indicativo, 1ª pessoa do singular).",
  "categoryId": "<uuid-categoria-portugues>",
  "grade": "7",
  "level": "2",
  "topics": [
    {
      "title": "Tempos verbais",
      "content": "Presente (ação atual), pretérito perfeito (ação concluída no passado), pretérito imperfeito (ação habitual no passado), futuro do presente."
    },
    {
      "title": "Modos verbais",
      "content": "Indicativo (certeza), subjuntivo (dúvida, hipótese), imperativo (ordem, pedido)."
    }
  ],
  "glossary": [
    {
      "word": "conjugação",
      "definition": "Flexão do verbo em pessoa, número, tempo e modo"
    },
    {
      "word": "infinitivo",
      "definition": "Forma nominal do verbo (terminada em -ar, -er, -ir)"
    }
  ],
  "tags": ["verbo", "conjugação", "tempo verbal", "modo verbal", "gramática"]
}
```

---

## Português — Nível 3

```json
{
  "title": "Análise sintática: sujeito, predicado e complementos",
  "contentText": "A oração é formada por sujeito (sobre quem se fala) e predicado (o que se declara sobre o sujeito). O predicado pode ser verbal (com verbo de ação) ou nominal (com verbo de ligação e predicativo). Os complementos verbais são: objeto direto (sem preposição), objeto indireto (com preposição) e complemento nominal. Exemplo: 'O aluno entregou a redação ao professor' — sujeito: O aluno; predicado: entregou a redação ao professor; objeto direto: a redação; objeto indireto: ao professor.",
  "categoryId": "<uuid-categoria-portugues>",
  "grade": "7",
  "level": "3",
  "topics": [
    {
      "title": "Sujeito e tipos",
      "content": "Sujeito simples (um núcleo), composto (mais de um núcleo), indeterminado (3ª pessoa do plural ou se + verbo), oculto (reconhecível pela desinência), oracional (oração subordinada substantiva)."
    },
    {
      "title": "Objeto direto e indireto",
      "content": "Objeto direto completa verbo transitivo direto sem preposição obrigatória. Objeto indireto completa verbo transitivo indireto com preposição (a, de, para, etc.)."
    }
  ],
  "glossary": [
    {
      "word": "predicado",
      "definition": "Parte da oração que contém o verbo e informa algo sobre o sujeito"
    },
    {
      "word": "objeto direto",
      "definition": "Complemento do verbo transitivo direto, sem preposição"
    }
  ],
  "tags": ["sintaxe", "sujeito", "predicado", "objeto direto", "objeto indireto"]
}
```

---

## Matemática — Nível 1

```json
{
  "title": "Introdução às frações",
  "contentText": "Uma fração representa uma parte de um todo. Ela é escrita na forma a/b, em que a é o numerador (partes consideradas) e b é o denominador (partes em que o todo foi dividido). Exemplo: 3/4 significa três partes de um todo dividido em quatro partes iguais. Frações equivalentes representam o mesmo valor (ex.: 1/2 = 2/4 = 4/8).",
  "categoryId": "<uuid-categoria-matematica>",
  "grade": "7",
  "level": "1",
  "topics": [
    {
      "title": "Numerador e denominador",
      "content": "O denominador indica em quantas partes iguais o todo foi dividido. O numerador indica quantas dessas partes estamos considerando."
    },
    {
      "title": "Frações equivalentes",
      "content": "Multiplicar ou dividir numerador e denominador pelo mesmo número não nulo gera frações equivalentes."
    }
  ],
  "glossary": [
    {
      "word": "fração",
      "definition": "Número que representa uma ou mais partes de um todo dividido em partes iguais"
    },
    {
      "word": "numerador",
      "definition": "Número acima do traço na fração; indica as partes consideradas"
    },
    {
      "word": "denominador",
      "definition": "Número abaixo do traço na fração; indica em quantas partes o todo foi dividido"
    }
  ],
  "tags": ["frações", "numerador", "denominador", "números racionais"]
}
```

---

## Matemática — Nível 2

```json
{
  "title": "Operações com frações",
  "contentText": "Para somar ou subtrair frações, é necessário que tenham o mesmo denominador. Se não tiverem, reduzimos ao mesmo denominador (mínimo múltiplo comum). Na multiplicação, multiplicamos numeradores entre si e denominadores entre si. Na divisão, mantemos a primeira fração e multiplicamos pelo inverso da segunda. Exemplo: 1/2 + 1/3 = 3/6 + 2/6 = 5/6.",
  "categoryId": "<uuid-categoria-matematica>",
  "grade": "7",
  "level": "2",
  "topics": [
    {
      "title": "Adição e subtração",
      "content": "Mesmo denominador: somamos ou subtraímos os numeradores e mantemos o denominador. Denominadores diferentes: calcular o MMC dos denominadores, converter as frações e depois operar."
    },
    {
      "title": "Multiplicação e divisão",
      "content": "Multiplicação: (a/b) × (c/d) = (a×c)/(b×d). Divisão: (a/b) ÷ (c/d) = (a/b) × (d/c)."
    }
  ],
  "glossary": [
    {
      "word": "MMC",
      "definition": "Mínimo múltiplo comum; menor número que é múltiplo de dois ou mais números"
    },
    {
      "word": "inverso",
      "definition": "O inverso de a/b é b/a (numerador e denominador trocados)"
    }
  ],
  "tags": ["frações", "adição", "subtração", "multiplicação", "divisão"]
}
```

---

## Matemática — Nível 3

```json
{
  "title": "Equações do 1º grau com uma incógnita",
  "contentText": "Uma equação do 1º grau é uma igualdade em que aparece uma incógnita (geralmente x) elevada ao expoente 1. Resolver a equação significa encontrar o valor da incógnita que torna a igualdade verdadeira. Para isso, isolamos a incógnita usando as operações inversas: o que está somando passa subtraindo, o que está multiplicando passa dividindo, e vice-versa. Exemplo: 2x + 5 = 13 → 2x = 8 → x = 4.",
  "categoryId": "<uuid-categoria-matematica>",
  "grade": "7",
  "level": "3",
  "topics": [
    {
      "title": "Princípio da igualdade",
      "content": "Ao adicionar, subtrair, multiplicar ou dividir os dois membros da equação pelo mesmo número (diferente de zero na divisão), a igualdade se mantém."
    },
    {
      "title": "Resolução passo a passo",
      "content": "Eliminar parênteses (se houver), reunir termos com incógnita em um membro e números no outro, reduzir e dividir pelo coeficiente da incógnita."
    }
  ],
  "glossary": [
    {
      "word": "incógnita",
      "definition": "Valor desconhecido na equação, geralmente representado por x"
    },
    {
      "word": "coeficiente",
      "definition": "Número que multiplica a incógnita (em 2x, o coeficiente é 2)"
    }
  ],
  "tags": ["equações", "1º grau", "álgebra", "incógnita"]
}
```

---

## História — Nível 1

```json
{
  "title": "Brasil Colonial: economia e sociedade",
  "contentText": "No período colonial, a economia brasileira foi marcada pelo cultivo da cana-de-açúcar no Nordeste e pela exploração de metais preciosos em Minas Gerais. A sociedade era estratificada: no topo, os donos de engenho e a Coroa; na base, indígenas e africanos escravizados. O trabalho escravo sustentou a produção açucareira e a mineração até o século XIX.",
  "categoryId": "<uuid-categoria-historia>",
  "grade": "7",
  "level": "1",
  "topics": [
    {
      "title": "Economia açucareira",
      "content": "O açúcar foi o principal produto de exportação do Brasil nos séculos XVI e XVII. Os engenhos concentravam-se no litoral nordestino e utilizavam mão de obra escrava."
    },
    {
      "title": "Mineração",
      "content": "No século XVIII, a descoberta de ouro e diamantes em Minas Gerais atraiu milhares de pessoas e deslocou o eixo econômico para a região Centro-Sul."
    }
  ],
  "glossary": [
    {
      "word": "engenho",
      "definition": "Propriedade rural onde a cana era processada para produzir açúcar"
    },
    {
      "word": "Casa-Grande",
      "definition": "Residência do senhor de engenho; centro do poder na sociedade colonial"
    }
  ],
  "tags": ["brasil colonial", "história do brasil", "século XVI", "escravidão"]
}
```

---

## História — Nível 2

```json
{
  "title": "Independência do Brasil e Primeiro Reinado",
  "contentText": "A independência do Brasil, proclamada em 7 de setembro de 1822, foi resultado de tensões entre a elite colonial e Portugal, da presença da família real no Brasil e do processo de crise do Antigo Regime. D. Pedro I tornou-se imperador. O Primeiro Reinado (1822-1831) foi marcado pela Constituição de 1824 (poder moderador), pela Guerra da Cisplatina e por conflitos com a Assembleia e com setores que defendiam maior autonomia e abolição da escravidão.",
  "categoryId": "<uuid-categoria-historia>",
  "grade": "7",
  "level": "2",
  "topics": [
    {
      "title": "Processo de independência",
      "content": "Revolução do Porto (1820), Dia do Fico (1822), Grito do Ipiranga. Papel das elites e de D. Pedro na separação de Portugal."
    },
    {
      "title": "Constituição de 1824",
      "content": "Outorgada pelo imperador; quatro poderes (Legislativo, Executivo, Judiciário e Moderador). O Moderador era exclusivo do monarca."
    }
  ],
  "glossary": [
    {
      "word": "poder moderador",
      "definition": "Poder do imperador de intervir nos outros poderes, previsto na Constituição de 1824"
    },
    {
      "word": "outorgada",
      "definition": "Constituição imposta pelo soberano, sem assembleia constituinte eleita"
    }
  ],
  "tags": ["independência", "primeiro reinado", "D. Pedro I", "Constituição 1824"]
}
```

---

## História — Nível 3

```json
{
  "title": "Segundo Reinado: café, imigração e abolição",
  "contentText": "O Segundo Reinado (1840-1889) consolidou o Estado nacional e teve na cultura do café a principal base econômica. A expansão cafeeira no Vale do Paraíba e depois no Oeste Paulista exigiu mão de obra: primeiro o tráfico interno de escravizados, depois a imigração europeia (italianos, portugueses, espanhóis). A abolição da escravidão (1888) foi resultado de pressões internas e internacionais e da resistência dos escravizados. A monarquia caiu em 1889, com a Proclamação da República.",
  "categoryId": "<uuid-categoria-historia>",
  "grade": "7",
  "level": "3",
  "topics": [
    {
      "title": "Ciclo do café",
      "content": "Café como principal produto de exportação. Barão de Mauá e ferrovias. Transição do trabalho escravo para o trabalho livre e imigração."
    },
    {
      "title": "Caminho da abolição",
      "content": "Lei Eusébio de Queirós (1850, fim do tráfico), Lei do Ventre Livre (1871), Lei dos Sexagenários (1885), Lei Áurea (1888). Movimento abolicionista e papel dos escravizados."
    }
  ],
  "glossary": [
    {
      "word": "Lei Áurea",
      "definition": "Lei de 13 de maio de 1888 que extinguiu a escravidão no Brasil"
    },
    {
      "word": "imigração subvencionada",
      "definition": "Política de trazer imigrantes com custeio parcial do governo ou dos cafeicultores"
    }
  ],
  "tags": ["segundo reinado", "café", "imigração", "abolicionismo", "Lei Áurea"]
}
```

---

## Como usar

1. Obtenha os **categoryId** de Português, Matemática e História (Prisma Studio → Category ou GET `/api/users` como coordenador).
2. Faça login como **Professor** que leciona a matéria (ou como **Coordenador**).
3. Para cada exemplo, substitua o placeholder do `categoryId` e o `grade` se quiser outra série.
4. Envie **POST** `{{baseUrl}}/api/contents` com header `Authorization: Bearer {{accessToken}}` e o body em JSON.
5. Resposta esperada: **201** com `{ "id": "<uuid>", "title": "..." }`.

Para **trilhas**: use apenas conteúdos com `level` **1**, **2** ou **3** (não use `reforco` na trilha).
