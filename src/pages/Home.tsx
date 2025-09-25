import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BarChart3, Sprout, TrendingUp, Leaf } from 'lucide-react';
import heroImage from '@/assets/hero-farming.jpg';
import yieldImage from '@/assets/yield-prediction.jpg';
import cropImage from '@/assets/crop-recommendation.jpg';

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-accent/60"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white max-w-6xl mx-auto px-4">
          <div className="fade-in-up stagger-1">
            <h1 className="text-7xl md:text-8xl font-bold mb-6 field-animation">
              AgroSanga
            </h1>
          </div>
          
          <div className="fade-in-up stagger-2">
            <p className="text-2xl md:text-3xl mb-8 font-light max-w-3xl mx-auto">
              AI-powered platform for yield prediction and crop recommendations
            </p>
          </div>
          
          <div className="fade-in-up stagger-3">
            <p className="text-lg md:text-xl mb-12 opacity-90 max-w-2xl mx-auto">
              Harness the power of artificial intelligence to optimize your farming decisions, 
              predict harvest yields, and get personalized crop recommendations based on your soil data.
            </p>
          </div>

          <div className="fade-in-up stagger-4 flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/predict-yield">
              <Button size="lg" className="btn-agriculture text-lg px-8 py-4 min-w-[200px]">
                <TrendingUp className="mr-2 h-5 w-5" />
                Get Started
              </Button>
            </Link>
            <Link to="/about">
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-4 min-w-[200px] bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <Leaf className="mr-2 h-5 w-5" />
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
          <div className="flex flex-col items-center">
            <span className="text-sm mb-2">Scroll Down</span>
            <div className="w-1 h-8 bg-white/50 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Main Features Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
              Smart Farming Solutions
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose from our AI-powered tools to make informed decisions about your crops and maximize your agricultural productivity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Predict Yield Card */}
            <Link to="/predict-yield" className="group">
              <Card className="card-natural p-8 h-full cursor-pointer group-hover:scale-105 transition-all duration-300">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6 overflow-hidden rounded-xl">
                    <img 
                      src={yieldImage} 
                      alt="Yield Prediction" 
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent"></div>
                  </div>
                  
                  <div className="mb-4 p-4 rounded-full bg-success/10">
                    <BarChart3 size={32} className="text-success" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4 text-primary">
                    Predict Your Yield Production
                  </h3>
                  
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Upload your soil report and get accurate yield predictions powered by advanced AI analysis. 
                    Know exactly how much your land can produce.
                  </p>
                  
                  <Button className="btn-agriculture w-full group-hover:shadow-glow">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Start Prediction
                  </Button>
                </div>
              </Card>
            </Link>

            {/* Recommend Crop Card */}
            <Link to="/recommend-crop" className="group">
              <Card className="card-natural p-8 h-full cursor-pointer group-hover:scale-105 transition-all duration-300">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6 overflow-hidden rounded-xl">
                    <img 
                      src={cropImage} 
                      alt="Crop Recommendation" 
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-accent/30 to-transparent"></div>
                  </div>
                  
                  <div className="mb-4 p-4 rounded-full bg-accent/10">
                    <Sprout size={32} className="text-accent-foreground" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4 text-primary">
                    Recommend the Crop
                  </h3>
                  
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Get personalized crop recommendations based on your soil analysis, weather patterns, 
                    and farm area. Make the best planting decisions.
                  </p>
                  
                  <Button className="btn-agriculture w-full group-hover:shadow-glow">
                    <Sprout className="mr-2 h-4 w-4" />
                    Get Recommendations
                  </Button>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Additional Info Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-6">
            Join Thousands of Smart Farmers
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            AgroSanga is helping farmers across the region make better decisions with AI-powered insights.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-lg opacity-80">Farmers Registered</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-lg opacity-80">Accuracy Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-lg opacity-80">Crops Analyzed</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;