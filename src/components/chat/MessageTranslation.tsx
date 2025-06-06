
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Languages, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MessageTranslationProps {
  messageId: string;
  originalText: string;
  onTranslationComplete: (translatedText: string, targetLanguage: string) => void;
}

const MessageTranslation = ({ messageId, originalText, onTranslationComplete }: MessageTranslationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('');
  const [translating, setTranslating] = useState(false);
  const { toast } = useToast();

  const languages = [
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'nl', name: 'Dutch' },
    { code: 'pl', name: 'Polish' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ar', name: 'Arabic' },
  ];

  const handleTranslate = async () => {
    if (!targetLanguage) {
      toast({
        title: 'Please select a language',
        description: 'Choose a target language for translation',
        variant: 'destructive'
      });
      return;
    }

    setTranslating(true);
    try {
      // For now, we'll use a simple mock translation service
      // In production, you would integrate with DeepL API or Google Translate
      const mockTranslation = `[${targetLanguage.toUpperCase()}] ${originalText}`;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onTranslationComplete(mockTranslation, targetLanguage);
      
      toast({
        title: 'Translation complete',
        description: `Message translated to ${languages.find(l => l.code === targetLanguage)?.name}`
      });

      setIsOpen(false);
      setTargetLanguage('');
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: 'Translation failed',
        description: 'Unable to translate message. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setTranslating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 px-2">
          <Languages className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Translate Message</DialogTitle>
          <DialogDescription>
            Select a target language to translate this message
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm"><strong>Original:</strong></p>
            <p className="text-sm text-gray-700 mt-1">{originalText}</p>
          </div>

          <div>
            <label className="text-sm font-medium">Target Language</label>
            <Select value={targetLanguage} onValueChange={setTargetLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Select a language..." />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={handleTranslate}
              disabled={!targetLanguage || translating}
              className="flex-1"
            >
              {translating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Translating...
                </>
              ) : (
                <>
                  <Languages className="h-4 w-4 mr-2" />
                  Translate
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessageTranslation;
