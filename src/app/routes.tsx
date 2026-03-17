import { createBrowserRouter } from "react-router";
import { lazy, Suspense } from "react";

// Eager load critical components
import { LandingPage } from "./components/LandingPage";
import { LoginScreen } from "./components/LoginScreen";
import { SignupScreen } from "./components/SignupScreen";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { NotFound } from "./components/NotFound";
import { MainApp } from "./components/MainApp";

// Lazy load other components
const AccountScreen = lazy(() => import("./components/AccountScreen").then(m => ({ default: m.AccountScreen })));
const CreateCard = lazy(() => import("./components/CreateCard").then(m => ({ default: m.CreateCard })));
const AddContentScreen = lazy(() => import("./components/AddContentScreen").then(m => ({ default: m.AddContentScreen })));
const InstructionsScreen = lazy(() => import("./components/InstructionsScreen").then(m => ({ default: m.InstructionsScreen })));
const TrainingScreen = lazy(() => import("./components/TrainingScreen").then(m => ({ default: m.TrainingScreen })));
const SubscriptionScreen = lazy(() => import("./components/SubscriptionScreen").then(m => ({ default: m.SubscriptionScreen })));
const CheckoutScreen = lazy(() => import("./components/CheckoutScreen").then(m => ({ default: m.CheckoutScreen })));
const ProfileScreen = lazy(() => import("./components/ProfileScreen").then(m => ({ default: m.ProfileScreen })));
const ProfileSetup = lazy(() => import("./components/ProfileSetup").then(m => ({ default: m.ProfileSetup })));
const FeaturedLinkSetup = lazy(() => import("./components/FeaturedLinkSetup").then(m => ({ default: m.FeaturedLinkSetup })));
const BuildNetwork = lazy(() => import("./components/BuildNetwork").then(m => ({ default: m.BuildNetwork })));
const Settings = lazy(() => import("./components/Settings").then(m => ({ default: m.Settings })));
const Setup = lazy(() => import("./components/Setup").then(m => ({ default: m.Setup })));
const PhoneDemo = lazy(() => import("./components/PhoneDemo").then(m => ({ default: m.PhoneDemo })));
const QuizSetup = lazy(() => import("./components/QuizSetup").then(m => ({ default: m.QuizSetup })));
const SurveySetup = lazy(() => import("./components/SurveySetup").then(m => ({ default: m.SurveySetup })));
const QuickEdit = lazy(() => import("./components/QuickEdit").then(m => ({ default: m.QuickEdit })));
const DevelopersScreen = lazy(() => import("./components/DevelopersScreen").then(m => ({ default: m.DevelopersScreen })));
const ApiKeyScreen = lazy(() => import("./components/ApiKeyScreen").then(m => ({ default: m.ApiKeyScreen })));
const AboutPlatformScreen = lazy(() => import("./components/AboutPlatformScreen").then(m => ({ default: m.AboutPlatformScreen })));
const TopCardsScreen = lazy(() => import("./components/TopCardsScreen").then(m => ({ default: m.TopCardsScreen })));
const CardDetailView = lazy(() => import("./components/CardDetailView").then(m => ({ default: m.CardDetailView })));
const TrainingDetailView = lazy(() => import("./components/TrainingDetailView").then(m => ({ default: m.TrainingDetailView })));
const AdminCreateAccount = lazy(() => import("./pages/AdminCreateAccount").then(m => ({ default: m.AdminCreateAccount })));
const AdminRestoreCards = lazy(() => import("./components/AdminRestoreCards").then(m => ({ default: m.AdminRestoreCards })));
const AdminCardManager = lazy(() => import("./components/AdminCardManager").then(m => ({ default: m.AdminCardManager })));
const SessionDiagnostic = lazy(() => import("./components/SessionDiagnostic").then(m => ({ default: m.SessionDiagnostic })));

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-3 border-gray-200 border-t-[#1e3a8a] rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    </div>
  );
}

function LazyComponent({ component: Component }: { component: React.ComponentType }) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Component />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/login",
    Component: LoginScreen,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/signup",
    Component: SignupScreen,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/app",
    Component: MainApp,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/home",
    Component: MainApp,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/account",
    element: <LazyComponent component={AccountScreen} />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/top-cards",
    element: <LazyComponent component={TopCardsScreen} />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/create",
    element: <LazyComponent component={CreateCard} />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/add-content",
    element: <LazyComponent component={AddContentScreen} />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/instructions",
    element: <LazyComponent component={InstructionsScreen} />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/training",
    element: <LazyComponent component={TrainingScreen} />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/subscription",
    element: <LazyComponent component={SubscriptionScreen} />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/checkout",
    element: <LazyComponent component={CheckoutScreen} />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/profile",
    element: <LazyComponent component={ProfileScreen} />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/profile-setup",
    element: <LazyComponent component={ProfileSetup} />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/featured-link",
    element: <LazyComponent component={FeaturedLinkSetup} />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/build-network",
    element: <LazyComponent component={BuildNetwork} />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/settings",
    element: <LazyComponent component={Settings} />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/setup",
    element: <LazyComponent component={Setup} />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/demo",
    element: <LazyComponent component={PhoneDemo} />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/quiz-setup",
    element: <LazyComponent component={QuizSetup} />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/survey-setup",
    element: <LazyComponent component={SurveySetup} />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/quick-edit",
    element: <LazyComponent component={QuickEdit} />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/developers",
    element: <LazyComponent component={DevelopersScreen} />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/api-key",
    element: <LazyComponent component={ApiKeyScreen} />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/about-platform",
    element: <LazyComponent component={AboutPlatformScreen} />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/admin/create-account",
    element: <LazyComponent component={AdminCreateAccount} />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/admin/restore-cards",
    element: <LazyComponent component={AdminRestoreCards} />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/admin/card-manager",
    element: <LazyComponent component={AdminCardManager} />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/session-diagnostic",
    element: <LazyComponent component={SessionDiagnostic} />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/card/:cardId",
    element: <LazyComponent component={CardDetailView} />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/module/:moduleId",
    element: <LazyComponent component={TrainingDetailView} />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "*",
    Component: NotFound,
    errorElement: <ErrorBoundary />,
  },
]);
