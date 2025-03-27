import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, MapPin, BarChart3, Bell, ChevronLeft, ChevronRight } from 'lucide-react';

export function LearnMorePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80',
      title: 'How SmartTrash Works',
      description: 'Discover how our platform revolutionizes waste management in Nairobi by connecting residents, businesses, and waste collectors through innovative technology.'
    },
    {
      image: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&q=80',
      title: 'Smart Waste Collection',
      description: 'Efficiently manage waste collection schedules and optimize routes for better service delivery.'
    },
    {
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80',
      title: 'Environmental Impact',
      description: 'Track and improve your environmental impact through our comprehensive analytics platform.'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const features = [
    {
      icon: <Users className="h-8 w-8 text-green-600" />,
      title: 'Community-Driven',
      description: 'Connect with your local community and contribute to a cleaner environment.',
      image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80'
    },
    {
      icon: <MapPin className="h-8 w-8 text-green-600" />,
      title: 'Smart Scheduling',
      description: 'Efficiently schedule waste collection based on your location and preferences.',
      image: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&q=80'
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-green-600" />,
      title: 'Real-time Analytics',
      description: 'Track waste collection patterns and environmental impact in your area.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80'
    },
    {
      icon: <Bell className="h-8 w-8 text-green-600" />,
      title: 'Instant Notifications',
      description: 'Receive timely updates about collection schedules and service changes.',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80'
    }
  ];

  const benefits = [
    {
      title: 'For Residents',
      items: [
        'Convenient waste collection scheduling',
        'Transparent pricing and service quality',
        'Community engagement opportunities',
        'Environmental impact tracking'
      ],
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80'
    },
    {
      title: 'For Businesses',
      items: [
        'Customized waste management solutions',
        'Compliance and reporting tools',
        'Cost optimization',
        'Sustainability metrics'
      ],
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80'
    },
    {
      title: 'For Collectors',
      items: [
        'Optimized collection routes',
        'Digital payment processing',
        'Customer management tools',
        'Performance analytics'
      ],
      image: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&q=80'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Slider */}
      <div className="relative h-[600px] overflow-hidden">
        {/* Slides */}
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${slide.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-50" />
            <div className="relative h-full flex items-center justify-center">
              <div className="text-center px-4">
                <h1 className="text-5xl font-bold text-white mb-6">
                  {slide.title}
                </h1>
                <p className="text-xl text-white max-w-3xl mx-auto">
                  {slide.description}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-30 hover:bg-opacity-50 text-white p-2 rounded-full transition-all duration-300"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-30 hover:bg-opacity-50 text-white p-2 rounded-full transition-all duration-300"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="relative h-48">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <div className="text-white text-center p-4">
                      <div className="mb-4">{feature.icon}</div>
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm">{feature.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Benefits for Everyone
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="relative h-48">
                  <img 
                    src={benefit.image} 
                    alt={benefit.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{benefit.title}</h3>
                  <ul className="space-y-3">
                    {benefit.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start">
                        <span className="text-green-600 mr-2">•</span>
                        <span className="text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="relative h-48 rounded-lg overflow-hidden mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80"
                  alt="Sign Up"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-green-600">1</span>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sign Up</h3>
              <p className="text-gray-600">Create your account and choose your role</p>
            </div>
            <div className="text-center">
              <div className="relative h-48 rounded-lg overflow-hidden mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80"
                  alt="Set Up Profile"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-green-600">2</span>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Set Up Profile</h3>
              <p className="text-gray-600">Complete your profile and preferences</p>
            </div>
            <div className="text-center">
              <div className="relative h-48 rounded-lg overflow-hidden mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80"
                  alt="Get Started"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-green-600">3</span>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Started</h3>
              <p className="text-gray-600">Begin using the platform's features</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-16">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80")',
            opacity: 0.8
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Join the Movement?
          </h2>
          <p className="text-xl text-white mb-8">
            Be part of Nairobi's sustainable waste management solution
          </p>
          <Link
            to="/register"
            className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 inline-flex items-center transition-colors duration-200"
          >
            Sign Up Now
          </Link>
        </div>
      </div>
    </div>
  );
} 