import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SoilData {
  nitrogen: number | null;
  phh2o: number | null;
  bdod: number | null;
  clay: number | null;
  sand: number | null;
  silt: number | null;
  soc: number | null;
  cec: number | null;
  wv0033: number | null;
  wv1500: number | null;
}

interface SoilInfoProps {
  soilData: SoilData | null;
}

const SoilInfo: React.FC<SoilInfoProps> = ({ soilData }) => {
  if (!soilData) return null;

  const formatValue = (value: number | null) => {
    return value !== null ? value.toFixed(2) : 'N/A';
  };

  const soilProperties = [
    { key: 'nitrogen', label: 'Nitrogen (N)', unit: 'mg/kg' },
    { key: 'phh2o', label: 'Soil pH', unit: 'pH' },
    { key: 'bdod', label: 'Bulk Density', unit: 'kg/dm³' },
    { key: 'clay', label: 'Clay Content', unit: '%' },
    { key: 'sand', label: 'Sand Content', unit: '%' },
    { key: 'silt', label: 'Silt Content', unit: '%' },
    { key: 'soc', label: 'Soil Organic Carbon', unit: 'g/kg' },
    { key: 'cec', label: 'Cation Exchange Capacity', unit: 'cmol/kg' },
    { key: 'wv0033', label: 'Water Content (33kPa)', unit: 'cm³/cm³' },
    { key: 'wv1500', label: 'Water Content (1500kPa)', unit: 'cm³/cm³' },
  ];

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Soil Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {soilProperties.map((prop) => (
            <div key={prop.key}>
              <p className="font-semibold">{prop.label}:</p>
              <p>{formatValue(soilData[prop.key as keyof SoilData])} {prop.unit}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default SoilInfo

