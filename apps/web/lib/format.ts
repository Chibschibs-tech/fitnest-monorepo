export const mad = (n:number) =>
  new Intl.NumberFormat('fr-MA', { style:'currency', currency:'MAD', maximumFractionDigits:0 }).format(n);
