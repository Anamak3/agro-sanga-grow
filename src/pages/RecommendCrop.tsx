import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Sprout, ArrowLeft, CheckCircle, AlertCircle, Cloud, Thermometer, Droplets } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  season: string;
}

interface CropRecommendation {
  cropName: string;
  suitability: number;
  expectedYield: string;
  growingPeriod: string;
}

interface RecommendationResult {
  recommendedCrops: CropRecommendation[];
  fertilizers: {
    type: string;
    dosage: string;
    applicationTime: string;
  }[];
  pestDiseaseInfo: {
    commonPests: string[];
    preventiveMeasures: string[];
  };
  weatherData: WeatherData;
}

const RecommendCrop = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [farmArea, setFarmArea] = useState<string>('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch user's farm area and weather data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        // Get user's profile to auto-fill farm area
        const { data: profile } = await supabase
          .from('profiles')
          .select('farm_area')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          setFarmArea(profile.farm_area.toString());
        }

        // Simulate weather API fetch (in real app, you'd use actual weather API)
        const mockWeather: WeatherData = {
          temperature: Math.round(25 + Math.random() * 10), // 25-35°C
          humidity: Math.round(60 + Math.random() * 30), // 60-90%
          rainfall: Math.round(50 + Math.random() * 100), // 50-150mm
          season: getCurrentSeason()
        };

        setWeatherData(mockWeather);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [user]);

  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 5) return 'Summer';
    if (month >= 6 && month <= 9) return 'Monsoon';
    return 'Winter';
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a JPG, PNG, or PDF file",
          variant: "destructive"
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 5MB",
          variant: "destructive"
        });
        return;
      }

      setSelectedFile(file);
      setResult(null);
    }
  };

  const simulateAnalysis = (): Promise<RecommendationResult> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const crops = ['Rice', 'Wheat', 'Maize', 'Sugarcane', 'Cotton', 'Soybean', 'Tomato', 'Onion'];
        const selectedCrops = crops.slice(0, 3 + Math.floor(Math.random() * 2));

        const mockResult: RecommendationResult = {
          recommendedCrops: selectedCrops.map(crop => ({
            cropName: crop,
            suitability: Math.round((70 + Math.random() * 25) * 10) / 10,
            expectedYield: `${Math.round((15 + Math.random() * 20) * 10) / 10} tons/hectare`,
            growingPeriod: `${90 + Math.floor(Math.random() * 60)} days`
          })),
          fertilizers: [
            {
              type: 'NPK (10:26:26)',
              dosage: `${Math.round((150 + Math.random() * 100) * 10) / 10} kg/hectare`,
              applicationTime: 'At sowing and flowering'
            },
            {
              type: 'Organic Compost',
              dosage: `${Math.round((2 + Math.random() * 3) * 10) / 10} tons/hectare`,
              applicationTime: 'Before land preparation'
            }
          ],
          pestDiseaseInfo: {
            commonPests: ['Aphids', 'Stem borer', 'Leaf roller', 'Thrips'],
            preventiveMeasures: [
              'Regular field monitoring',
              'Use of pheromone traps',
              'Biological pest control',
              'Crop rotation practices'
            ]
          },
          weatherData: weatherData!
        };
        resolve(mockResult);
      }, 4000);
    });
  };

  const handleAnalysis = async () => {
    if (!selectedFile || !user || !weatherData) {
      toast({
        title: "Error",
        description: "Please upload a soil report and ensure weather data is loaded",
        variant: "destructive"
      });
      return;
    }

    try {
      setAnalyzing(true);
      setProgress(20);

      // Upload file
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('soil-reports')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      setProgress(50);

      // Simulate AI analysis
      const analysisResult = await simulateAnalysis();
      
      setProgress(90);

      // Save recommendation to database
      const { error: dbError } = await supabase
        .from('crop_recommendations')
        .insert({
          user_id: user.id,
          recommended_crops: analysisResult.recommendedCrops.map(c => c.cropName),
          fertilizer_info: analysisResult.fertilizers as any,
          pest_disease_info: analysisResult.pestDiseaseInfo as any,
          weather_data: analysisResult.weatherData as any,
          farm_area: parseFloat(farmArea)
        });

      if (dbError) {
        console.error('Error saving recommendation:', dbError);
      }

      setProgress(100);
      setResult(analysisResult);
      
      toast({
        title: "Analysis Complete!",
        description: "Your crop recommendations are ready",
      });

    } catch (error: any) {
      console.error('Error during analysis:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Something went wrong during analysis",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-4">
        <Card className="card-natural max-w-md w-full text-center">
          <CardContent className="pt-6">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-warning" />
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground mb-4">
              Please sign in to access crop recommendation features.
            </p>
            <Link to="/login">
              <Button className="btn-agriculture">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4">
      <div className="container mx-auto max-w-6xl">
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          Back to Home
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">Crop Recommendations</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get AI-powered crop recommendations based on your soil analysis and local weather conditions
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Weather Data Card */}
            {weatherData && (
              <Card className="card-natural">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Cloud className="mr-2 h-5 w-5" />
                    Weather Data
                  </CardTitle>
                  <CardDescription>Current local weather conditions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Thermometer className="h-4 w-4 text-orange-500" />
                      <div>
                        <div className="font-medium">{weatherData.temperature}°C</div>
                        <div className="text-muted-foreground">Temperature</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      <div>
                        <div className="font-medium">{weatherData.humidity}%</div>
                        <div className="text-muted-foreground">Humidity</div>
                      </div>
                    </div>
                    <div className="col-span-2 pt-2 border-t">
                      <div className="font-medium">Season: {weatherData.season}</div>
                      <div className="text-sm text-muted-foreground">
                        Rainfall: {weatherData.rainfall}mm (monthly avg)
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upload Section */}
            <Card className="card-natural">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Soil Report
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <Label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center space-y-2">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm font-medium">Upload soil report</span>
                  </Label>
                </div>

                {selectedFile && (
                  <div className="bg-muted/50 p-3 rounded text-sm">
                    <div className="font-medium">{selectedFile.name}</div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="farm-area">Farm Area (acres)</Label>
                  <Input
                    id="farm-area"
                    type="number"
                    value={farmArea}
                    onChange={(e) => setFarmArea(e.target.value)}
                    placeholder="Enter farm area"
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">Auto-filled from your profile</p>
                </div>

                {analyzing && (
                  <div className="space-y-2">
                    <Progress value={progress} />
                    <p className="text-sm text-center text-muted-foreground">
                      Analyzing soil and weather data...
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleAnalysis}
                  disabled={!selectedFile || analyzing}
                  className="w-full btn-agriculture"
                >
                  {analyzing ? "Analyzing..." : (
                    <>
                      <Sprout className="mr-2 h-4 w-4" />
                      Get Recommendations
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            <Card className="card-natural">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sprout className="mr-2 h-5 w-5" />
                  Recommendation Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div className="space-y-8">
                    {/* Recommended Crops */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <CheckCircle className="mr-2 h-5 w-5 text-success" />
                        Recommended Crops
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {result.recommendedCrops.map((crop, index) => (
                          <div key={index} className="border rounded-lg p-4 bg-card">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-lg">{crop.cropName}</h4>
                              <Badge variant="secondary" className="bg-success/10 text-success">
                                {crop.suitability}% suitable
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <div>Expected Yield: {crop.expectedYield}</div>
                              <div>Growing Period: {crop.growingPeriod}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Fertilizers */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Fertilizer Recommendations</h3>
                      <div className="space-y-3">
                        {result.fertilizers.map((fertilizer, index) => (
                          <div key={index} className="border rounded-lg p-4 bg-card">
                            <div className="font-medium mb-1">{fertilizer.type}</div>
                            <div className="text-sm text-muted-foreground">
                              <div>Dosage: {fertilizer.dosage}</div>
                              <div>Application: {fertilizer.applicationTime}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pest & Disease Info */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Pest & Disease Management</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="border rounded-lg p-4 bg-card">
                          <h4 className="font-medium mb-2">Common Pests</h4>
                          <ul className="text-sm space-y-1">
                            {result.pestDiseaseInfo.commonPests.map((pest, index) => (
                              <li key={index} className="text-muted-foreground">• {pest}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="border rounded-lg p-4 bg-card">
                          <h4 className="font-medium mb-2">Preventive Measures</h4>
                          <ul className="text-sm space-y-1">
                            {result.pestDiseaseInfo.preventiveMeasures.map((measure, index) => (
                              <li key={index} className="text-muted-foreground">• {measure}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Sprout className="mx-auto h-12 w-12 mb-4" />
                    <p>Upload your soil report to get personalized crop recommendations</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendCrop;