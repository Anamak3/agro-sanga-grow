import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, TrendingUp, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PredictionResult {
  soilData: {
    pH: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    organicMatter: number;
  };
  predictedYield: number;
  recommendations: string[];
}

const PredictYield = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a JPG, PNG, or PDF file",
          variant: "destructive"
        });
        return;
      }

      // Validate file size (max 5MB)
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

  const simulateAnalysis = () => {
    return new Promise<PredictionResult>((resolve) => {
      // Simulate AI analysis with random but realistic data
      setTimeout(() => {
        const mockResult: PredictionResult = {
          soilData: {
            pH: Math.round((6.0 + Math.random() * 2.5) * 100) / 100, // 6.0-8.5
            nitrogen: Math.round((15 + Math.random() * 25) * 10) / 10, // 15-40 ppm
            phosphorus: Math.round((8 + Math.random() * 17) * 10) / 10, // 8-25 ppm
            potassium: Math.round((80 + Math.random() * 120) * 10) / 10, // 80-200 ppm
            organicMatter: Math.round((1.5 + Math.random() * 2.5) * 100) / 100 // 1.5-4.0%
          },
          predictedYield: Math.round((25 + Math.random() * 50) * 100) / 100, // 25-75 tons/ha
          recommendations: [
            "Soil pH is optimal for most crops",
            "Consider organic fertilizer application",
            "Monitor nitrogen levels during growing season",
            "Good phosphorus content supports root development"
          ]
        };
        resolve(mockResult);
      }, 3000);
    });
  };

  const handleAnalysis = async () => {
    if (!selectedFile || !user) {
      toast({
        title: "Error",
        description: "Please select a file and make sure you're logged in",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);
      setProgress(10);

      // Upload file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('soil-reports')
        .upload(fileName, selectedFile);

      if (uploadError) {
        throw uploadError;
      }

      setProgress(40);
      setUploading(false);
      setAnalyzing(true);

      // Simulate AI analysis
      const analysisResult = await simulateAnalysis();
      
      setProgress(80);

      // Save prediction to database
      const { error: dbError } = await supabase
        .from('yield_predictions')
        .insert({
          user_id: user.id,
          soil_data: analysisResult.soilData,
          predicted_yield: analysisResult.predictedYield,
          file_url: fileName
        });

      if (dbError) {
        console.error('Error saving prediction:', dbError);
        // Continue showing results even if saving fails
      }

      setProgress(100);
      setResult(analysisResult);
      
      toast({
        title: "Analysis Complete!",
        description: "Your yield prediction is ready",
      });

    } catch (error: any) {
      console.error('Error during analysis:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Something went wrong during analysis",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
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
              Please sign in to access yield prediction features.
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
      <div className="container mx-auto max-w-4xl">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">Yield Prediction</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload your soil report and get AI-powered yield predictions for your farm
          </p>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card className="card-natural">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="mr-2 h-5 w-5" />
                Upload Soil Report
              </CardTitle>
              <CardDescription>
                Upload your soil analysis report in JPG, PNG, or PDF format (max 5MB)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <Label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <FileText className="h-12 w-12 text-muted-foreground" />
                  <span className="font-medium">Click to upload soil report</span>
                  <span className="text-sm text-muted-foreground">
                    JPG, PNG, or PDF (max 5MB)
                  </span>
                </Label>
              </div>

              {selectedFile && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">{selectedFile.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}

              {/* Progress Bar */}
              {(uploading || analyzing) && (
                <div className="space-y-2">
                  <Progress value={progress} className="w-full" />
                  <p className="text-sm text-center text-muted-foreground">
                    {uploading ? 'Uploading file...' : 'Analyzing soil data...'}
                  </p>
                </div>
              )}

              <Button
                onClick={handleAnalysis}
                disabled={!selectedFile || uploading || analyzing}
                className="w-full btn-agriculture"
              >
                {uploading || analyzing ? (
                  "Processing..."
                ) : (
                  <>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Get Yield Prediction
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="card-natural">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Prediction Results
              </CardTitle>
              <CardDescription>
                AI analysis of your soil data and yield prediction
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-6">
                  {/* Predicted Yield */}
                  <div className="text-center p-6 bg-success/10 rounded-lg border border-success/20">
                    <div className="flex items-center justify-center mb-2">
                      <CheckCircle className="h-6 w-6 text-success mr-2" />
                      <h3 className="text-lg font-semibold">Predicted Yield</h3>
                    </div>
                    <div className="text-3xl font-bold text-success mb-1">
                      {result.predictedYield} tons/hectare
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Based on current soil conditions
                    </p>
                  </div>

                  {/* Soil Data */}
                  <div>
                    <h4 className="font-semibold mb-3">Extracted Soil Data</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-muted/50 p-3 rounded">
                        <div className="font-medium">pH Level</div>
                        <div className="text-lg font-semibold">{result.soilData.pH}</div>
                      </div>
                      <div className="bg-muted/50 p-3 rounded">
                        <div className="font-medium">Nitrogen</div>
                        <div className="text-lg font-semibold">{result.soilData.nitrogen} ppm</div>
                      </div>
                      <div className="bg-muted/50 p-3 rounded">
                        <div className="font-medium">Phosphorus</div>
                        <div className="text-lg font-semibold">{result.soilData.phosphorus} ppm</div>
                      </div>
                      <div className="bg-muted/50 p-3 rounded">
                        <div className="font-medium">Potassium</div>
                        <div className="text-lg font-semibold">{result.soilData.potassium} ppm</div>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h4 className="font-semibold mb-3">Recommendations</h4>
                    <ul className="space-y-2">
                      {result.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start text-sm">
                          <CheckCircle className="h-4 w-4 text-success mr-2 mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <TrendingUp className="mx-auto h-12 w-12 mb-4" />
                  <p>Upload and analyze your soil report to see results here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PredictYield;