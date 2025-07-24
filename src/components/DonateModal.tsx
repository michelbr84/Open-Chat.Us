import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Bitcoin, DollarSign, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DonateModalProps {
  onClose: () => void;
}

export const DonateModal = ({ onClose }: DonateModalProps) => {
  const { toast } = useToast();
  
  // Example addresses - replace with real ones
  const btcAddress = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";
  const ethAddress = "0x742d35Cc6634C0532925a3b8D3AC19d5ae36a564";
  const paypalLink = "https://www.paypal.com/donate?hosted_button_id=YOUR_BUTTON_ID";

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
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md neon-bg neon-border">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-0 top-0 h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
          <CardTitle className="text-xl font-bold neon-glow flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Support OpenChat
          </CardTitle>
          <CardDescription>
            Help keep OpenChat running by making a donation. Every contribution helps!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="crypto" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="crypto">Cryptocurrency</TabsTrigger>
              <TabsTrigger value="traditional">Traditional</TabsTrigger>
            </TabsList>
            
            <TabsContent value="crypto" className="space-y-6">
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
            </TabsContent>
            
            <TabsContent value="traditional" className="space-y-4">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="font-semibold mb-2">PayPal</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Make a secure donation via PayPal
                  </p>
                  <Button asChild className="w-full">
                    <a 
                      href={paypalLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      <DollarSign className="w-4 h-4" />
                      Donate via PayPal
                    </a>
                  </Button>
                </div>
                
                <div className="text-center border-t pt-4">
                  <p className="text-xs text-muted-foreground">
                    Other payment methods coming soon!
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Thank you for supporting open communication! 💬
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};