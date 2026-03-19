import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, CreditCard, Lock, Check } from "lucide-react";
import { Button } from "./ui/button";
import { supabase, API_BASE_URL, getAuthHeaders } from "@/supabase";
import { toast } from "sonner";

export function CheckoutScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tier = searchParams.get('tier') || 'creator';
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  
  // Account form state for new users
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [ageVerified, setAgeVerified] = useState(false);
  
  // Form state
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [billingZip, setBillingZip] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      console.log('Checking authentication status...');
      
      // Check for OAuth callback in URL (hash or query params)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const hasOAuthParams = hashParams.has('access_token') || window.location.search.includes('code=');
      
      if (hasOAuthParams) {
        console.log('OAuth callback detected, processing...');
        setGoogleLoading(true);
      }
      
      // Get the current session (Supabase will auto-handle OAuth callback)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
      }
      
      if (session) {
        console.log('User authenticated:', session.user.email);
        
        // Check if this is right after OAuth (has the params in URL)
        if (hasOAuthParams) {
          toast.success('Signed in with Google!', {
            description: `Welcome, ${session.user.email}`,
            duration: 3000,
          });
          
          // Clean up the URL
          const cleanUrl = `${window.location.pathname}?tier=${tier}`;
          window.history.replaceState({}, document.title, cleanUrl);
        }
        
        setUserEmail(session.user.email || "");
        setEmail(session.user.email || "");
        setFullName(session.user.user_metadata?.full_name || "");
        setIsNewUser(false);
        setGoogleLoading(false);
      } else {
        console.log('No active session - showing signup form');
        setIsNewUser(true);
        setGoogleLoading(false);
      }
    };

    checkAuth();
  }, [tier]);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    
    try {
      console.log('Starting Google OAuth sign-in...');
      
      // Store the selected tier in localStorage so we can retrieve it after OAuth redirect
      localStorage.setItem('checkout_tier', tier);
      
      // Check if Supabase client is initialized
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }
      
      console.log('Calling supabase.auth.signInWithOAuth...');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/checkout?tier=${tier}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      console.log('OAuth response:', { data, error });

      if (error) {
        console.error('Google sign-in error:', error);
        toast.error('Google sign-in failed', {
          description: error.message || 'Unable to connect to Google. Please check your configuration.',
          duration: 5000,
        });
        setGoogleLoading(false);
        return;
      }
      
      if (!data?.url) {
        console.error('No OAuth URL returned');
        toast.error('Google sign-in failed', {
          description: 'No redirect URL received. Please verify Google OAuth is enabled in Supabase.',
          duration: 5000,
        });
        setGoogleLoading(false);
        return;
      }
      
      console.log('Redirecting to Google OAuth URL:', data.url);
      // If successful, user will be redirected to Google
    } catch (error) {
      console.error('Error during Google sign-in:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error('Google sign-in failed', {
        description: `${errorMessage}. Please try email sign-up instead.`,
        duration: 5000,
      });
      setGoogleLoading(false);
    }
  };

  const planDetails: { [key: string]: { name: string; price: string; period: string } } = {
    creator: { name: "Creator", price: "$4.99", period: "per month" },
    pro: { name: "Pro", price: "$9.99", period: "per month" },
    enterprise: { name: "Enterprise", price: "$12.99", period: "per month" },
  };

  const plan = planDetails[tier] || planDetails.creator;

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '');
    if (value.length <= 16 && /^\d*$/.test(value)) {
      setCardNumber(formatCardNumber(value));
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setExpiryDate(formatExpiryDate(value));
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setCvv(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate account fields for new users
    if (isNewUser) {
      if (!email || !email.includes('@')) {
        toast.error('Please enter a valid email address');
        return;
      }
      if (!password || password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      if (!fullName) {
        toast.error('Please enter your full name');
        return;
      }
      if (!ageVerified) {
        toast.error('Please verify your age');
        return;
      }
    }
    
    // Validate payment fields
    if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
      toast.error('Please enter a valid card number');
      return;
    }
    if (!expiryDate || expiryDate.length !== 5) {
      toast.error('Please enter a valid expiry date');
      return;
    }
    if (!cvv || cvv.length < 3) {
      toast.error('Please enter a valid CVV');
      return;
    }
    if (!cardName) {
      toast.error('Please enter the cardholder name');
      return;
    }
    if (!billingZip) {
      toast.error('Please enter your billing ZIP code');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create account if new user
      if (isNewUser) {
        console.log('Creating new account for:', email);
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (signUpError) {
          console.error('Sign up error:', signUpError);
          toast.error('Account creation failed', {
            description: signUpError.message,
            duration: 5000,
          });
          setLoading(false);
          return;
        }

        if (!signUpData.session) {
          toast.error('Account creation failed', {
            description: 'Please try again or contact support',
            duration: 5000,
          });
          setLoading(false);
          return;
        }

        console.log('Account created successfully, proceeding with payment');
        // Session is now active, continue with payment
      }

      // Step 2: Process payment
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/subscription/upgrade`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          tier,
          paymentDetails: {
            cardNumber: cardNumber.replace(/\s/g, ''),
            expiryDate,
            cvv,
            cardName,
            billingZip,
          }
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Welcome to nAnoCards!', {
          description: `Your ${plan.name} subscription is now active. ${isNewUser ? 'Account created successfully!' : ''}`,
          duration: 5000,
        });
        
        // Redirect to app with success message
        setTimeout(() => {
          navigate('/app?upgrade=success');
        }, 2000);
      } else {
        toast.error('Payment failed', {
          description: data.error || 'Please check your payment details and try again',
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Error processing checkout:", error);
      toast.error('Checkout failed', {
        description: 'Network error - please try again',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/subscription')}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium text-sm">Back to Plans</span>
            </button>
            <div className="flex items-center gap-2 text-green-600">
              <Lock className="w-4 h-4" />
              <span className="text-xs font-medium">Secure Checkout</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Payment Form - Left Side (2 columns) */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Information</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Account Creation Section - Only for new users */}
                {isNewUser && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4 mb-4">
                    <h3 className="text-base font-semibold text-blue-900">Create Your Account</h3>
                    
                    {/* Full Name */}
                    <div>
                      <label htmlFor="checkout-fullName" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        id="checkout-fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                        required
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="checkout-email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        id="checkout-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                        required
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <label htmlFor="checkout-password" className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <input
                        id="checkout-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                        required
                      />
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label htmlFor="checkout-confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password
                      </label>
                      <input
                        id="checkout-confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                        required
                      />
                    </div>

                    {/* Age Verification */}
                    <div className="flex items-center gap-2">
                      <input
                        id="checkout-ageVerify"
                        type="checkbox"
                        checked={ageVerified}
                        onChange={(e) => setAgeVerified(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        required
                      />
                      <label htmlFor="checkout-ageVerify" className="text-sm text-gray-700">
                        I am 13 years of age or older
                      </label>
                    </div>

                    {/* Create Account Button */}
                    <button
                      type="button"
                      onClick={async () => {
                        // Validate fields
                        if (!email || !email.includes('@')) {
                          toast.error('Please enter a valid email address');
                          return;
                        }
                        if (!password || password.length < 6) {
                          toast.error('Password must be at least 6 characters');
                          return;
                        }
                        if (password !== confirmPassword) {
                          toast.error('Passwords do not match');
                          return;
                        }
                        if (!fullName) {
                          toast.error('Please enter your full name');
                          return;
                        }
                        if (!ageVerified) {
                          toast.error('Please verify your age');
                          return;
                        }

                        setGoogleLoading(true);

                        try {
                          console.log('Creating new account for:', email);
                          
                          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                            email: email,
                            password: password,
                            options: {
                              data: {
                                full_name: fullName,
                              },
                            },
                          });

                          if (signUpError) {
                            console.error('Sign up error:', signUpError);
                            toast.error('Account creation failed', {
                              description: signUpError.message,
                              duration: 5000,
                            });
                            setGoogleLoading(false);
                            return;
                          }

                          if (!signUpData.session) {
                            toast.error('Account creation failed', {
                              description: 'Please try again or contact support',
                              duration: 5000,
                            });
                            setGoogleLoading(false);
                            return;
                          }

                          console.log('Account created successfully');
                          toast.success('Account created!', {
                            description: 'Now complete your payment details below.',
                            duration: 3000,
                          });
                          
                          setUserEmail(email);
                          setIsNewUser(false);
                          setGoogleLoading(false);
                        } catch (error) {
                          console.error('Error creating account:', error);
                          toast.error('Account creation failed', {
                            description: 'Please try again',
                            duration: 5000,
                          });
                          setGoogleLoading(false);
                        }
                      }}
                      disabled={googleLoading}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-900 hover:bg-blue-800 text-white rounded-lg transition-colors font-semibold"
                    >
                      {googleLoading ? 'Creating Account...' : 'Create Account'}
                    </button>
                  </div>
                )}

                <h3 className="text-base font-semibold text-gray-900 pt-2">Payment Details</h3>

                {/* Card Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                      required
                    />
                    <CreditCard className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                {/* Expiry and CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={expiryDate}
                      onChange={handleExpiryChange}
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      value={cvv}
                      onChange={handleCvvChange}
                      placeholder="123"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Cardholder Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                    required
                  />
                </div>

                {/* Billing ZIP */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Billing ZIP Code
                  </label>
                  <input
                    type="text"
                    value={billingZip}
                    onChange={(e) => setBillingZip(e.target.value)}
                    placeholder="12345"
                    maxLength={10}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                    required
                  />
                </div>

                {/* Security Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                  <Lock className="w-5 h-5 text-blue-900 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-blue-900 mb-1">Secure Payment</p>
                    <p className="text-xs text-blue-800">
                      Your payment information is encrypted and secure. We never store your card details.
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-900 hover:bg-blue-800 text-white h-12 rounded-lg text-base font-semibold"
                >
                  {loading ? 'Processing...' : `Subscribe to ${plan.name}`}
                </Button>
              </form>
            </div>
          </div>

          {/* Order Summary - Right Side (1 column) */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-20">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
              
              {/* Plan Details */}
              <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">{plan.name} Plan</p>
                    <p className="text-xs text-gray-600">{plan.period}</p>
                  </div>
                  <p className="font-bold text-gray-900">{plan.price}</p>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                <p className="text-xs font-semibold text-gray-700 mb-2">Included:</p>
                {tier === 'creator' && (
                  <>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-700">10 cards</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-700">Training Center access</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-700">Advanced analytics</p>
                    </div>
                  </>
                )}
                {tier === 'pro' && (
                  <>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-700">Up to 49 cards</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-700">Training Center access</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-700">Team collaboration</p>
                    </div>
                  </>
                )}
                {tier === 'enterprise' && (
                  <>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-700">LMS integration</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-700">Up to 100 team members</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-700">Dedicated account manager</p>
                    </div>
                  </>
                )}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center mb-4">
                <p className="font-bold text-gray-900">Total</p>
                <p className="text-2xl font-bold text-blue-900">{plan.price}</p>
              </div>

              {/* Account Info */}
              {userEmail && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Billing to:</p>
                  <p className="text-xs font-medium text-gray-900">{userEmail}</p>
                </div>
              )}

              {/* Cancel Info */}
              <p className="text-xs text-gray-600 mt-4 text-center">
                Cancel anytime from your account settings
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}