import { createTheme, MantineColorsTuple } from '@mantine/core';

// Design system YVYCAP — identidade institucional premium
export const tokens = {
  verdeEscuro: '#0c352a',
  verde: '#124534',
  verdeClaro: '#1b5c46',
  dourado: '#c8a45e',
  douradoClaro: '#dbba76',
  fundo: '#f6f3ec',
  card: '#fffdf8',
  texto: '#22302b',
  textoSecundario: '#66756e',
  borda: '#e5decf',
} as const;

const brand: MantineColorsTuple = [
  '#eef5f1',
  '#d7e6df',
  '#adcfc0',
  '#7fb69f',
  '#57a183',
  '#3d9371',
  '#2d8763',
  '#1b5c46', // 7 — verde-claro
  '#124534', // 8 — verde
  '#0c352a', // 9 — verde-escuro (primária/header)
];

const gold: MantineColorsTuple = [
  '#faf6ee',
  '#f1e8d4',
  '#e5d3ab',
  '#dbba76', // 3 — dourado-claro
  '#d2ab63',
  '#c8a45e', // 5 — dourado (destaque/CTAs)
  '#b5924e',
  '#977841',
  '#7a6136',
  '#5e4a2a',
];

export const theme = createTheme({
  colors: { brand, gold },
  primaryColor: 'gold',
  primaryShade: 5,
  black: tokens.texto,
  defaultRadius: 'md',
  fontFamily: 'var(--font-inter), Inter, sans-serif',
  headings: {
    fontFamily: 'var(--font-fraunces), Fraunces, serif',
    fontWeight: '600',
  },
  components: {
    Card: {
      defaultProps: { withBorder: true, radius: 'md', padding: 'lg' },
      styles: {
        root: { backgroundColor: tokens.card, borderColor: tokens.borda },
      },
    },
    Paper: {
      styles: { root: { backgroundColor: tokens.card, borderColor: tokens.borda } },
    },
    Button: { defaultProps: { radius: 'md' } },
    Badge: { defaultProps: { radius: 'sm' } },
    Modal: { styles: { content: { backgroundColor: tokens.card } } },
  },
});
