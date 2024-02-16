type Bid = string; // F.eks. "1NT", "1H", "Pass", etc.

export class BridgeContract {
  // Metode for å bestemme åpningsmeldingen basert på poengsum
  static determineOpeningBid(points: number): Bid {
    if (points < 12) {
      return "Pass";
    } else if (points >= 12 && points <= 14) {
      return "1NT"; // Eksempel: No Trumps åpning for 12-14 poeng
    } else if (points > 14 && points <= 17) {
      // Her kan du legge til logikk basert på fordelingen av hånden for mer nøyaktige åpningsmeldinger
      return "1H"; // Anta en åpning med hjerter som eksempel
    } else {
      // Mer avanserte åpningsstrategier for høyere poengsummer kan implementeres her
      return "2NT"; // Eksempel for høyere poengsum
    }
  }
}
