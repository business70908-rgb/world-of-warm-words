import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Capacitor } from '@capacitor/core';
import { useKeyboardFix } from "@/hooks/useKeyboardFix";
import SplashScreen from "@/pages/SplashScreen";
import { nativeStorage } from "@/lib/nativeStorage";
import { migrateLocalStorageToNative } from "@/lib/migration/localStorageToNative";
import { initializePermissions } from "@/lib/permissions";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "@/pages/Index";
import Menu from "@/pages/Menu";
import Pass from "@/pages/Pass";
import CitySelection from "@/pages/CitySelection";
import AccountSettings from "@/pages/AccountSettings";
import TummocMoney from "@/pages/TummocMoney";
import Language from "@/pages/Language";
import SavedPlaces from "@/pages/SavedPlaces";
import UserInfo from "@/pages/UserInfo";
import Referrals from "@/pages/Referrals";
import TermsOfUse from "@/pages/TermsOfUse";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import RefundPolicy from "@/pages/RefundPolicy";
import TummocBlog from "@/pages/TummocBlog";
import Contact from "@/pages/Contact";
import Environment from "@/pages/Environment";
import VoteNow from "@/pages/VoteNow";
import Help from "@/pages/Help";
import AddMoney from "@/pages/AddMoney";
import TransactionHistory from "@/pages/TransactionHistory";
import Metro from "@/pages/Metro";
import BmtcPass from "@/pages/Bmtc-pass";
import Identity from "@/pages/Identity";
import Images from "@/pages/Images";
import AllInOne from "@/pages/AllInOne";
import RedBus from "@/pages/RedBus";
import Maps from "@/pages/Maps";
import Generation from "@/pages/Generation";
import Final from "@/pages/Final";
import Scan from "@/pages/Scan";
import Direction from "@/pages/Direction";
import Login from "@/pages/Login";
import ServerValidation from "@/pages/ServerValidation";
import NotFound from "@/pages/NotFound";
import BusinessLinkingTerms from "@/pages/BusinessLinkingTerms";
import PlanMyTrip from "@/pages/PlanMyTrip";

export const AppWithSplash = () => {
  const [showSplash, setShowSplash] = useState(true);

  // Fix: prevent page from staying "lifted" after keyboard dismissal on Android/iOS
  useKeyboardFix();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Log platform info for debugging
        console.log('Platform:', Capacitor.getPlatform());
        console.log('Is Native:', Capacitor.isNativePlatform());
        
        // 1. Initialize native storage
        await nativeStorage.initialize();
        
        // 2. Create folder structure
        await nativeStorage.createFolderStructure();
        
        // 3. Run migration if needed
        await migrateLocalStorageToNative();
        
        // 4. Initialize permissions (camera, storage, etc.)
        await initializePermissions();
        
        console.log('App initialization complete');
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
      
      // 5. Show splash screen then transition
      setTimeout(() => {
        setShowSplash(false);
      }, 1800);
    };

    initializeApp();
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/server-validation" element={<ServerValidation />} />
      <Route path="/splash" element={<SplashScreen />} />
      <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      <Route path="/menu" element={<ProtectedRoute><Menu /></ProtectedRoute>} />
      <Route path="/pass" element={<ProtectedRoute><Pass /></ProtectedRoute>} />
      <Route path="/city-selection" element={<ProtectedRoute><CitySelection /></ProtectedRoute>} />
      <Route path="/account-settings" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
      <Route path="/tummoc-money" element={<ProtectedRoute><TummocMoney /></ProtectedRoute>} />
      <Route path="/language" element={<ProtectedRoute><Language /></ProtectedRoute>} />
      <Route path="/saved-places" element={<ProtectedRoute><SavedPlaces /></ProtectedRoute>} />
      <Route path="/user-info" element={<ProtectedRoute><UserInfo /></ProtectedRoute>} />
      <Route path="/referrals" element={<ProtectedRoute><Referrals /></ProtectedRoute>} />
      <Route path="/terms-of-use" element={<ProtectedRoute><TermsOfUse /></ProtectedRoute>} />
      <Route path="/privacy-policy" element={<ProtectedRoute><PrivacyPolicy /></ProtectedRoute>} />
      <Route path="/refund-policy" element={<ProtectedRoute><RefundPolicy /></ProtectedRoute>} />
      <Route path="/tummoc-blog" element={<ProtectedRoute><TummocBlog /></ProtectedRoute>} />
      <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
      <Route path="/environment" element={<ProtectedRoute><Environment /></ProtectedRoute>} />
      <Route path="/vote-now" element={<ProtectedRoute><VoteNow /></ProtectedRoute>} />
      <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
      <Route path="/add-money" element={<ProtectedRoute><AddMoney /></ProtectedRoute>} />
      <Route path="/transaction-history" element={<ProtectedRoute><TransactionHistory /></ProtectedRoute>} />
      <Route path="/metro" element={<ProtectedRoute><Metro /></ProtectedRoute>} />
      <Route path="/bmtc-pass" element={<ProtectedRoute><BmtcPass /></ProtectedRoute>} />
      <Route path="/identity" element={<ProtectedRoute><Identity /></ProtectedRoute>} />
      <Route path="/images" element={<ProtectedRoute><Images /></ProtectedRoute>} />
      <Route path="/all-in-one" element={<ProtectedRoute><AllInOne /></ProtectedRoute>} />
      <Route path="/red-bus" element={<ProtectedRoute><RedBus /></ProtectedRoute>} />
      <Route path="/maps" element={<ProtectedRoute><Maps /></ProtectedRoute>} />
      <Route path="/generation" element={<ProtectedRoute><Generation /></ProtectedRoute>} />
      <Route path="/final" element={<ProtectedRoute><Final /></ProtectedRoute>} />
      <Route path="/scan" element={<ProtectedRoute><Scan /></ProtectedRoute>} />
      <Route path="/direction" element={<ProtectedRoute><Direction /></ProtectedRoute>} />
      <Route path="/business-linking-terms" element={<ProtectedRoute><BusinessLinkingTerms /></ProtectedRoute>} />
      <Route path="/plan-my-trip" element={<ProtectedRoute><PlanMyTrip /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
