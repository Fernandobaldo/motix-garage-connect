import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, X } from "lucide-react";

const DemoVideoSection = () => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // YouTube video ID for the demo - you can replace this with your actual demo video
  const demoVideoId = "dQw4w9WgXcQ"; // Replace with your actual YouTube video ID

  return (
    <section id="demo-video" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            See Motix Garage in Action
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Watch how workshop owners and clients interact seamlessly through our platform
          </p>
        </div>

        <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative">
            {/* Video thumbnail overlay */}
            <div className="absolute inset-0 bg-black/20"></div>
            
            {/* Demo screenshot/thumbnail background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-purple-900/80"></div>
            
            {/* Play button */}
            <Button 
              size="lg" 
              className="relative z-10 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full transform hover:scale-105 transition-all duration-200"
              onClick={() => setIsVideoModalOpen(true)}
            >
              <Play className="mr-2 h-6 w-6" />
              Play Demo Video
            </Button>

            {/* Mock UI elements in background */}
            <div className="absolute inset-4 border border-white/20 rounded-lg opacity-30"></div>
            <div className="absolute top-8 left-8 w-24 h-6 bg-white/20 rounded"></div>
            <div className="absolute top-8 right-8 w-16 h-6 bg-white/20 rounded"></div>
            <div className="absolute bottom-8 left-8 right-8 h-16 bg-white/10 rounded"></div>
          </div>
        </div>

        {/* Video Modal */}
        <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
          <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
            <DialogHeader className="sr-only">
              <DialogTitle>Motix Garage Demo Video</DialogTitle>
            </DialogHeader>
            
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full"
              onClick={() => setIsVideoModalOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>

            {/* YouTube Embed */}
            <div className="aspect-video w-full">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${demoVideoId}?autoplay=1&rel=0&modestbranding=1`}
                title="Motix Garage Demo Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Process steps - keep existing */}
        <div className="grid md:grid-cols-4 gap-6 mt-12">
          <div className="text-center">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 font-bold">1</span>
            </div>
            <h3 className="font-semibold mb-2">Client Booking</h3>
            <p className="text-sm text-gray-600">Customer books service online</p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-green-600 font-bold">2</span>
            </div>
            <h3 className="font-semibold mb-2">Digital Quote</h3>
            <p className="text-sm text-gray-600">Workshop sends detailed quote</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-purple-600 font-bold">3</span>
            </div>
            <h3 className="font-semibold mb-2">Real-time Chat</h3>
            <p className="text-sm text-gray-600">Translated communication</p>
          </div>
          <div className="text-center">
            <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-orange-600 font-bold">4</span>
            </div>
            <h3 className="font-semibold mb-2">Job Completion</h3>
            <p className="text-sm text-gray-600">Approval and job tracking</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoVideoSection;
