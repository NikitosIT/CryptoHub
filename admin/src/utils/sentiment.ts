export function getSentimentStyles(sentiment: string): string {
  switch (sentiment) {
    case "positive":
      return "bg-green-600/20 text-green-400";
    case "negative":
      return "bg-red-600/20 text-red-400";
    default:
      return "bg-gray-600/20 text-gray-400";
  }
}

export function getSentimentLabel(sentiment: string): string {
  switch (sentiment) {
    case "positive":
      return "Положительный";
    case "negative":
      return "Отрицательный";
    default:
      return "Нейтральный";
  }
}

