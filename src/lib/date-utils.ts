/**
 * Função para corrigir o problema de fuso horário ao lidar com datas
 * Quando um input date é lido, ele pode perder um dia devido ao fuso horário
 * Esta função garante que a data mantém o dia correto
 */
export function fixDateTimezone(dateString: string): string {
  if (!dateString) return dateString;
  
  // Para inputs tipo date vazios
  if (dateString === '') return dateString;
  
  // Cria a data no fuso horário local
  const date = new Date(dateString);
  
  // Ajusta para o fuso horário local para evitar perda de dia
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  
  // Retorna no formato YYYY-MM-DD
  return date.toISOString().split('T')[0];
}

/**
 * Formata uma data no padrão brasileiro (DD/MM/YYYY)
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  try {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  } catch (error) {
    return dateString;
  }
} 