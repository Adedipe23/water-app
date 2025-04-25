
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { WaterProvider } from './contexts/WaterContext';
import { ReminderProvider } from './contexts/ReminderContext';
import Header from './components/Header';
import WaterButton from './components/WaterButton';
import DailyProgress from './components/DailyProgress';
import StreakTracker from './components/StreakTracker';
import GoalSetting from './components/GoalSetting';
import ReminderSettings from './components/ReminderSettings';
import WaterLogHistory from './components/WaterLogHistory';
import WaterStats from './components/WaterStats';
import AuthGuard from './components/auth/AuthGuard';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WaterProvider>
          <ReminderProvider>
            <AuthGuard>
              <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
                <Header />
                <main className="container mx-auto px-4 py-8">
                  <div className="max-w-6xl mx-auto">
                    {/* Main water button section */}
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                        Track Your Water Intake
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                        Stay hydrated throughout the day. Tap the button each time you drink water to track your intake and maintain your hydration streak.
                      </p>

                      <WaterButton />
                    </div>

                    {/* Progress and streak section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <DailyProgress />
                      <StreakTracker />
                    </div>

                    {/* Stats and history section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                      <WaterStats />
                      <WaterLogHistory />
                    </div>

                    {/* Settings section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <GoalSetting />
                      <ReminderSettings />
                    </div>
                  </div>
                </main>
                <footer className="bg-white dark:bg-gray-800 py-4 mt-12">
                  <div className="container mx-auto px-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                    &copy; {new Date().getFullYear()} Water Tracker App. All rights reserved.
                  </div>
                </footer>
              </div>
            </AuthGuard>
          </ReminderProvider>
        </WaterProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
