
import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, FileQuestion, HardDrive, Monitor, Network, User, Lock } from "lucide-react";

const faqData = {
  hardware: [
    {
      question: "My computer won't turn on. What should I do?",
      answer: "First, check if the power cable is connected properly. Make sure the power outlet works by plugging in another device. If the computer still doesn't turn on, check if the power button on the back of the desktop is switched on. If none of these steps work, contact IT support for further assistance."
    },
    {
      question: "How do I connect to a printer?",
      answer: "To connect to a printer: 1) Make sure the printer is powered on and connected to the network, 2) Go to Settings > Devices > Printers & scanners, 3) Click 'Add a printer or scanner', 4) Select your printer from the list, and 5) Follow the installation instructions. If your printer doesn't appear, try clicking 'The printer that I want isn't listed' for more options."
    },
    {
      question: "My monitor is displaying weird colors or flickering",
      answer: "First try reconnecting your monitor cable on both ends. If that doesn't work, try a different cable or connect the monitor to another computer to determine if the issue is with the monitor or the computer. You can also try updating your graphics drivers or adjusting the refresh rate in display settings."
    }
  ],
  software: [
    {
      question: "How do I update my operating system?",
      answer: "For Windows: Go to Settings > Update & Security > Windows Update and click 'Check for updates'. For macOS: Go to Apple menu > System Preferences > Software Update. For Linux: Use your distribution's package manager or update command (e.g., 'sudo apt update && sudo apt upgrade' for Ubuntu)."
    },
    {
      question: "I can't install or update an application",
      answer: "Ensure you have sufficient disk space and administrator privileges. Try closing all applications and restarting your computer. If the problem persists, download the installation file again (it might be corrupted), or try running the installer in compatibility mode."
    },
    {
      question: "How do I recover deleted files?",
      answer: "First, check your Recycle Bin/Trash. If not there, you might be able to restore from a previous backup (Time Machine on Mac or File History on Windows). If no backup exists, try using data recovery software like Recuva or Disk Drill, but act quickly before the data is overwritten."
    }
  ],
  network: [
    {
      question: "I can't connect to the WiFi network",
      answer: "Make sure WiFi is turned on your device. Verify you're selecting the correct network and using the right password. Try forgetting the network and reconnecting. If still not working, restart your device and the WiFi router. You may also try resetting your network settings."
    },
    {
      question: "How do I set up a VPN connection?",
      answer: "To set up a VPN: 1) Obtain VPN credentials from IT, 2) On Windows, go to Settings > Network & Internet > VPN > Add a VPN connection, 3) On Mac, go to System Preferences > Network > '+' > VPN, 4) Enter the VPN details provided by IT, 5) Connect using the credentials provided. For specific company VPN apps, follow the installation guide provided by IT."
    },
    {
      question: "Why is my internet connection slow?",
      answer: "Slow internet can be caused by: many users sharing the connection, large downloads/uploads in progress, wireless interference, outdated network drivers, or issues with your ISP. Try restarting your router, moving closer to the access point, connecting via ethernet if possible, or contacting IT if the problem persists."
    }
  ],
  account: [
    {
      question: "How do I reset my password?",
      answer: "To reset your password, go to the login page and click 'Forgot Password'. Follow the instructions to reset your password via email. If you cannot access your email, contact the IT support desk with proper identification to request a password reset."
    },
    {
      question: "I'm locked out of my account",
      answer: "If you're locked out of your account, wait 15 minutes and try again. If you still can't access your account, use the 'Forgot Password' option or contact IT support. Be prepared to verify your identity with employee ID, department, and manager information."
    },
    {
      question: "How do I update my email signature?",
      answer: "For Outlook: Go to File > Options > Mail > Signatures. For Gmail: Go to Settings > General > Signature. For company template signatures, download the template from the intranet and follow the customization instructions, or contact IT for assistance."
    }
  ]
};

const KnowledgeBase = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredFaqs = () => {
    let results = [];
    
    // Get FAQs based on active category
    if (activeCategory === 'all') {
      Object.values(faqData).forEach(category => {
        results = [...results, ...category];
      });
    } else if (faqData[activeCategory as keyof typeof faqData]) {
      results = faqData[activeCategory as keyof typeof faqData];
    }
    
    // Filter based on search query if it exists
    if (searchQuery.trim() !== '') {
      return results.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return results;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
        <p className="text-muted-foreground">
          Find answers to common questions and technical issues
        </p>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search for solutions..." 
          className="pl-10 w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <FileQuestion size={16} />
            <span>All Topics</span>
          </TabsTrigger>
          <TabsTrigger value="hardware" className="flex items-center gap-2">
            <HardDrive size={16} />
            <span>Hardware</span>
          </TabsTrigger>
          <TabsTrigger value="software" className="flex items-center gap-2">
            <Monitor size={16} />
            <span>Software</span>
          </TabsTrigger>
          <TabsTrigger value="network" className="flex items-center gap-2">
            <Network size={16} />
            <span>Network</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User size={16} />
            <span>Account</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeCategory} className="mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>
                Frequently Asked Questions
                {searchQuery && <span className="ml-2 text-sm font-normal text-muted-foreground">Results for "{searchQuery}"</span>}
              </CardTitle>
              <CardDescription>
                {filteredFaqs().length === 0
                  ? "No results found. Try adjusting your search terms."
                  : `Showing ${filteredFaqs().length} result${filteredFaqs().length !== 1 ? 's' : ''}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaqs().map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pt-2 pb-4 text-muted-foreground">
                          {faq.answer}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </ScrollArea>
            </CardContent>
            <CardFooter>
              <div className="flex items-center justify-between w-full">
                <div className="text-sm text-muted-foreground">
                  Can't find what you're looking for?
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                  <Lock size={16} />
                  Submit a Ticket
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KnowledgeBase;
