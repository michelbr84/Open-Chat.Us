import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { X, Bitcoin, DollarSign, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DonateModalProps {
  onClose: () => void;
}

export const DonateModal = ({ onClose }: DonateModalProps) => {
  const { toast } = useToast();
  
  // Cryptocurrency addresses
  const btcAddress = "3FV6kFsNTXEzPpLKKG5SrChXdgGSSNFN9P";
  const ethAddress = "0xe527C13F23799e5a7d038B70765128c5e928f07d";
  

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${type} address copied to clipboard.`,
    });
  };

  const QRCode = ({ data, alt }: { data: string; alt: string }) => (
    <div className="flex justify-center">
      <img 
        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data)}`}
        alt={alt}
        className="border border-border rounded-lg"
        loading="lazy"
        width="150"
        height="150"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="w-full max-w-md min-h-screen sm:min-h-0 sm:my-8 flex items-start sm:items-center">
        <Card className="w-full max-h-[90vh] sm:max-h-[80vh] neon-bg neon-border flex flex-col">
          <CardHeader className="relative flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute right-2 top-2 h-8 w-8 p-0 z-10"
            >
              <X className="w-4 h-4" />
            </Button>
            <CardTitle className="text-xl font-bold neon-glow flex items-center gap-2 pr-10">
              <DollarSign className="w-5 h-5" />
              Support OpenChat
            </CardTitle>
            <CardDescription>
              Help keep OpenChat running by making a donation. Every contribution helps!
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            <div className="space-y-6">
              {/* Bitcoin */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Bitcoin className="w-5 h-5 text-orange-500" />
                  <h3 className="font-semibold">Bitcoin (BTC)</h3>
                </div>
                <QRCode data={btcAddress} alt="Bitcoin QR Code" />
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-muted p-2 rounded text-xs break-all">
                    {btcAddress}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(btcAddress, 'Bitcoin')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Ethereum */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                    Ξ
                  </div>
                  <h3 className="font-semibold">Ethereum (ETH)</h3>
                </div>
                <QRCode data={ethAddress} alt="Ethereum QR Code" />
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-muted p-2 rounded text-xs break-all">
                    {ethAddress}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(ethAddress, 'Ethereum')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                Thank you for supporting open communication! 💬
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};