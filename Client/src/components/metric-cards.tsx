import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "../components/ui/card"
  
  export function MetricCards() {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Lowest Score",    value: 2  },
          { label: "Lower Quartile",  value: 42 },
          { label: "Median",          value: 65 },
          { label: "Upper Quartile",  value: 74 },
          { label: "Highest score",   value: 93 },
        ].map((c) => (
          <Card
            key={c.label}
            style={{
              backgroundColor: "#000000",
              border:          "1px solid #27272A",
            }}
          >
            <CardHeader className="!pb-0"> 
              <CardDescription className="text-white">
                {c.label}
              </CardDescription>
            </CardHeader>
  
            <CardContent className="!pt-0"> 
              <CardTitle className="text-3xl text-white">
                {c.value}
              </CardTitle>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }