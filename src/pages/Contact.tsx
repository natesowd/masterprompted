import Header from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Mail } from "lucide-react";

const contactSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required" }).max(100),
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  subject: z.string().trim().min(1, { message: "Subject is required" }).max(200),
  message: z.string().trim().min(1, { message: "Message is required" }).max(1000),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const Contact = () => {
  const { t } = useLanguage();
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    const mailtoLink = `mailto:prompted.issues@eipcm.org?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(
      `Name: ${data.name}\nEmail: ${data.email}\n\nMessage:\n${data.message}`
    )}`;
    
    window.location.href = mailtoLink;
    toast.success("Opening your email client...");
    form.reset();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-6">
            {t('contact.title')}
          </h1>
          
          <div className="bg-card rounded-lg border p-8 mb-6">
            <div className="flex items-start gap-3 mb-6">
              <Mail className="w-6 h-6 text-primary mt-1" />
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Get in Touch
                </h2>
                <p className="text-muted-foreground mb-4">
                  Have questions or feedback? We'd love to hear from you. Fill out the form below or email us directly at{" "}
                  <a 
                    href="mailto:eipcm@eipcm.org" 
                    className="text-primary hover:underline font-medium"
                  >
                    prompted.issues@eipcm.org
                  </a>
                </p>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="your.email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="How can we help?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us more about your question or feedback..."
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full md:w-auto">
                  Send Message
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;
