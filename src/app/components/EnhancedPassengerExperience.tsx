import { SimpleJourneyPlanner } from './SimpleJourneyPlanner';

// Add our new live features to the passenger experience
export function EnhancedPassengerExperience() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Metro Rail Scheduler
          </h1>
          <p className="text-gray-600">
            Live train status • Smart journey planning • Saved routes
          </p>
        </div>
        
        <SimpleJourneyPlanner />
      </div>
    </div>
  );
}