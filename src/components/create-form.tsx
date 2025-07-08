"use client";

import z from "zod";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { formSchema } from "@/schema/createSchema";
import { Form, FormControl, FormField, FormItem } from "./ui/form";
import RetryCopy from "./retry-copy";

const CreateForm = () => {
  const [retry, setRetry] = useState(false);
  const [link, setLink] = useState("");
  const [clipboard, setClipboard] = useState<Clipboard | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (navigator.clipboard) {
      setClipboard(navigator.clipboard);
    } else {
      console.error("Clipboard API not available");
    }
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      link: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    const timeA = new Date();

    if (values.link.startsWith(window.location.href)) {
      toast.info(`Looks like you tried to shorten a shortened link!`, {});
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/create?link=${values.link}`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to create");
      }

      const data: { link: string } = await res.json();
      const baseUrl = window.location.href;
      const fullLink = `${baseUrl}${data.link}`;

      const timeTaken = new Date().getTime() - timeA.getTime();

      setLink(fullLink);
      form.setValue("link", fullLink);
      form.setFocus("link");

      try {
        if (clipboard) {
          await clipboard.writeText(fullLink);
          toast.success(`Link copied to clipboard in ${timeTaken}ms`, {});
        } else throw new Error("Clipboard API unavailable");
      } catch (error) {
        toast.success(`Link created in ${timeTaken}ms`, {});
        setRetry(true);
        console.error(error);
      }
    } catch (error) {
      toast.error("Failed to create link. Are you rate limited?");
      console.error(error);
    }

    setLoading(false);
  };
  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 flex flex-col items-center justify-center"
        >
          <FormField
            control={form.control}
            name="link"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl className="w-full">
                  <Input className="w-full" id="link-ak03fj" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <Button
            disabled={loading}
            className="max-w-48 w-full cursor-pointer"
            variant="secondary"
            type="submit"
          >
            {loading ? "Shortening..." : "Shorten"}
          </Button>
        </form>
      </Form>
      {retry && <RetryCopy retry={retry} setRetry={setRetry} link={link} />}
    </>
  );
};

export default CreateForm;
