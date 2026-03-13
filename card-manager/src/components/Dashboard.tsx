import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface DashboardProps {
  total: number;
  totalPowerPoints: number;
  totalDiamonds: number;
  cardsWithAbilities: number;
}

export function Dashboard({
  total,
  totalPowerPoints,
  totalDiamonds,
  cardsWithAbilities,
}: DashboardProps) {
  return (
    <div className="grid grid-cols-4 gap-4 p-6">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-blue-600 font-medium">Charaktere</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-blue-900">{total}</p>
          <p className="text-xs text-blue-600 mt-1">Gesamt</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-yellow-600 font-medium">Machtpunkte</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-yellow-900">{totalPowerPoints}</p>
          <p className="text-xs text-yellow-600 mt-1">Σ alle Karten</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-purple-600 font-medium">Diamanten</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-purple-900">{totalDiamonds}</p>
          <p className="text-xs text-purple-600 mt-1">Σ alle Belohnungen</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-pink-600 font-medium">Fähigkeiten</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-pink-900">{cardsWithAbilities}</p>
          <p className="text-xs text-pink-600 mt-1">{Math.round((cardsWithAbilities / Math.max(1, total)) * 100)}% der Karten</p>
        </CardContent>
      </Card>
    </div>
  );
}
