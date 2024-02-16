Velkommen til en forenklet Bridge-Robot server som håndterer:
- Registrering, sletting og henting av spillerliste. 
- Fordeling av hele kortstokken bestående av 52 kort, til hver av de 4 spillerne, 13 kort til hver.
- Beregner poeng for spillers hånd, og melder bud etter poengberegning.

Den er laget med følgende pekere

Hent ut spillerliste (GET):
/players

Hent spiller etter id (GET):
/players/:id

Legg til spiller med navn og id (north, south, east, west) (POST):
/players

Slett spiller etter id (DELETE):
/players/:id

Fordel 52 kort til 4 spillere 13 hver (GET):
/deal

Hent ut spillers hånd etter id (GET):
/players/:id/hand

Velge et enkelt kort fra spillers hånd (GET):
/players/:id/hand/:cardIndex

Poengberegning for spillers hånd (GET):
/players/:id/points

Melde bud etter poengberegning (GET):
/players/:id/bid"