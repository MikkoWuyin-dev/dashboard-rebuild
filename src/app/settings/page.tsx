import { Fragment } from "react"

import { AvatarUpload } from "@/components/avatar-upload"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

const TEXT_FIELDS = [
  {
    id: "name",
    label: "Name",
    description: "This will be displayed next to your avatar.",
    value: "Mia Ward",
    type: "text",
  },
  {
    id: "job-title",
    label: "Job title",
    description: "Write your job position.",
    value: "Sales Manager",
    type: "text",
  },
  {
    id: "phone",
    label: "Phone number",
    description: "We'll use this number for security reasons.",
    value: "(212) 555-0192",
    type: "tel",
  },
]

const BIO_VALUE =
  "Sales manager leading the mid-market team. Focused on pipeline health, rep coaching, and keeping our forecast honest."

export default function SettingsPage() {
  return (
    <div className="flex flex-col">
      <header className="flex flex-col gap-3 p-4 lg:gap-4 lg:p-7">
        <div className="flex flex-col gap-3 lg:gap-4">
          <h1 className="text-xl font-semibold tracking-tight text-balance md:text-2xl">
            Settings
          </h1>
        </div>
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>
        </Tabs>
        <Separator />
      </header>
      <div className="flex flex-col gap-7 px-4 pt-4 lg:px-7">
        {TEXT_FIELDS.map((f) => (
          <Fragment key={f.id}>
            <Field
              orientation="horizontal"
              className="max-w-3xl flex-col items-stretch gap-2 lg:flex-row lg:items-start"
            >
              <FieldContent className="lg:w-80 lg:flex-none">
                <FieldLabel htmlFor={f.id}>{f.label}</FieldLabel>
                <FieldDescription>{f.description}</FieldDescription>
              </FieldContent>
              <Input
                id={f.id}
                name={f.id}
                type={f.type}
                defaultValue={f.value}
                className="w-full lg:w-70"
              />
            </Field>
            <Separator />
          </Fragment>
        ))}
        <Field
          orientation="horizontal"
          className="max-w-3xl flex-col items-stretch gap-2 lg:flex-row lg:items-start"
        >
          <FieldContent className="lg:w-80 lg:flex-none">
            <FieldLabel>Avatar</FieldLabel>
            <FieldDescription>This will appear next to your name.</FieldDescription>
          </FieldContent>
          <AvatarUpload src="/avatars/mia-ward.png" fallback="MW" />
        </Field>
        <Separator />
        <Field
          orientation="horizontal"
          className="max-w-3xl flex-col items-stretch gap-2 lg:flex-row lg:items-start"
        >
          <FieldContent className="lg:w-80 lg:flex-none">
            <FieldLabel htmlFor="bio">Bio</FieldLabel>
            <FieldDescription>Let other people know you better.</FieldDescription>
          </FieldContent>
          <Textarea
            id="bio"
            name="bio"
            defaultValue={BIO_VALUE}
            className="min-h-24 w-full lg:w-104"
          />
        </Field>
      </div>
      <div className="flex justify-end gap-2 px-4 py-7 lg:px-7">
        <Button variant="outline">Discard</Button>
        <Button>Save changes</Button>
      </div>
    </div>
  )
}
