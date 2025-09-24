import { useState } from "react";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import EvaluationPanel from "@/components/EvaluationPanel";
import SentPrompt from "@/components/SentPrompt";
import VideoLightbox from "@/components/VideoLightbox";
import ControlledDialog from "@/components/ControlledDialog";
import UncontrolledDialog from "@/components/UncontrolledDialog";
import { PopoverSeries } from "@/components/PopoverSeries";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";

const ComponentLibrary = () => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const showToast = () => {
    toast({
      title: "Toast Example",
      description: "This is a sample toast notification",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-6">
            Component Library
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            A visual showcase of all available components in the project
          </p>
          
          {/* Custom Components Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-6">Custom Components</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* SentPrompt Component */}
              <Card>
                <CardHeader>
                  <CardTitle>SentPrompt</CardTitle>
                  <CardDescription>User message display component</CardDescription>
                </CardHeader>
                <CardContent>
                  <SentPrompt 
                    text="This is an example of a sent prompt message with an attachment"
                    fileName="example_document.pdf"
                  />
                </CardContent>
              </Card>

              {/* Breadcrumb Component */}
              <Card>
                <CardHeader>
                  <CardTitle>Breadcrumb</CardTitle>
                  <CardDescription>Navigation breadcrumb component</CardDescription>
                </CardHeader>
                <CardContent>
                  <Breadcrumb />
                </CardContent>
              </Card>

              {/* EvaluationPanel Component */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>EvaluationPanel</CardTitle>
                  <CardDescription>Journalistic evaluation criteria panel</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-w-md">
                    <EvaluationPanel />
                  </div>
                </CardContent>
              </Card>

              {/* VideoLightbox Component */}
              <Card>
                <CardHeader>
                  <CardTitle>VideoLightbox</CardTitle>
                  <CardDescription>Video player with lightbox functionality</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => setIsVideoOpen(true)}>Open Video</Button>
                  <VideoLightbox 
                    isOpen={isVideoOpen}
                    onClose={() => setIsVideoOpen(false)}
                    videoUrl="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  />
                </CardContent>
              </Card>

              {/* Dialog Components */}
              <Card>
                <CardHeader>
                  <CardTitle>Dialog Components</CardTitle>
                  <CardDescription>Modal dialog examples (click buttons to open)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline">Open Controlled Dialog</Button>
                  <Button variant="outline">Open Uncontrolled Dialog</Button>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* UI Components Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-6">UI Components</h2>
            
            {/* Buttons */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Buttons</CardTitle>
                <CardDescription>Various button styles and variants</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button variant="default">Default</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                  <Button size="sm">Small</Button>
                  <Button size="lg">Large</Button>
                  <Button disabled>Disabled</Button>
                </div>
              </CardContent>
            </Card>

            {/* Form Elements */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Form Elements</CardTitle>
                <CardDescription>Input fields, textareas, and form controls</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="input-example">Input Field</Label>
                    <Input id="input-example" placeholder="Enter text here" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="textarea-example">Textarea</Label>
                    <Textarea id="textarea-example" placeholder="Enter long text here" />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox id="checkbox-example" />
                  <Label htmlFor="checkbox-example">Checkbox example</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="switch-example" />
                  <Label htmlFor="switch-example">Switch example</Label>
                </div>

                <RadioGroup defaultValue="option1" className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option1" id="r1" />
                    <Label htmlFor="r1">Option 1</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option2" id="r2" />
                    <Label htmlFor="r2">Option 2</Label>
                  </div>
                </RadioGroup>

                <Select>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                    <SelectItem value="option3">Option 3</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Display Elements */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Display Elements</CardTitle>
                <CardDescription>Badges, avatars, progress bars, and alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge variant="outline">Outline</Badge>
                </div>

                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg" alt="Avatar" />
                    <AvatarFallback>AB</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback>CD</AvatarFallback>
                  </Avatar>
                </div>

                <div className="space-y-2">
                  <Label>Progress Example</Label>
                  <Progress value={60} className="w-[300px]" />
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Alert Example</AlertTitle>
                  <AlertDescription>
                    This is an example alert with an icon and description.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Layout Components */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Layout Components</CardTitle>
                <CardDescription>Tabs, accordions, separators, and loading states</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="tab1" className="w-[400px]">
                  <TabsList>
                    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                    <TabsTrigger value="tab3">Tab 3</TabsTrigger>
                  </TabsList>
                  <TabsContent value="tab1">Content for tab 1</TabsContent>
                  <TabsContent value="tab2">Content for tab 2</TabsContent>
                  <TabsContent value="tab3">Content for tab 3</TabsContent>
                </Tabs>

                <Accordion type="single" collapsible className="w-[400px]">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Accordion Item 1</AccordionTrigger>
                    <AccordionContent>
                      Content for accordion item 1
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Accordion Item 2</AccordionTrigger>
                    <AccordionContent>
                      Content for accordion item 2
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="space-y-4">
                  <Label>Separator</Label>
                  <Separator />
                </div>

                <div className="space-y-2">
                  <Label>Loading Skeletons</Label>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interactive Elements */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Interactive Elements</CardTitle>
                <CardDescription>Tooltips and toasts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline">Hover for tooltip</Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This is a tooltip example</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Button onClick={showToast} variant="outline">
                  Show Toast
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ComponentLibrary;