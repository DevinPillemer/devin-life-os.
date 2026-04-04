"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Key, Globe, User, Shield, ExternalLink } from "lucide-react";

interface ApiConfig {
  name: string;
  description: string;
  envVars: string[];
  connected: boolean;
  docsUrl: string;
}

const apiConfigs: ApiConfig[] = [
  {
    name: "Strava",
    description: "Fitness tracking — runs, swims, rides",
    envVars: ["STRAVA_CLIENT_ID", "STRAVA_CLIENT_SECRET", "STRAVA_REFRESH_TOKEN"],
    connected: false,
    docsUrl: "https://developers.strava.com/",
  },
  {
    name: "Notion",
    description: "Goals database and project tracking",
    envVars: ["NOTION_API_KEY", "NOTION_GOALS_DB_ID"],
    connected: false,
    docsUrl: "https://developers.notion.com/",
  },
  {
    name: "Google Sheets",
    description: "Finance portfolio and transaction data",
    envVars: ["GOOGLE_SHEETS_ID", "GOOGLE_SERVICE_ACCOUNT_JSON"],
    connected: false,
    docsUrl: "https://developers.google.com/sheets/api",
  },
  {
    name: "Google Calendar",
    description: "Daily schedule and event management",
    envVars: ["GOOGLE_CALENDAR_ID"],
    connected: false,
    docsUrl: "https://developers.google.com/calendar",
  },
];

export default function SettingsPage() {
  const [timezone] = useState("Asia/Jerusalem");

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <Header />

      {/* Profile */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <User className="w-4 h-4 text-text-muted" />
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-text-muted block mb-1">Name</label>
            <p className="text-sm text-text-primary font-medium">Devin Pillemer</p>
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">Role</label>
            <p className="text-sm text-text-primary font-medium">Head of SDR</p>
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">Location</label>
            <p className="text-sm text-text-primary font-medium">Tel Aviv / Haifa, Israel</p>
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">Timezone</label>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-accent" />
              <p className="text-sm text-text-primary font-medium">{timezone}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* API Integrations */}
      <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
        <Key className="w-5 h-5 text-accent" />
        API Integrations
      </h2>
      <div className="space-y-4 mb-8">
        {apiConfigs.map((api) => (
          <Card key={api.name}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-text-primary">{api.name}</h3>
                  <Badge variant={api.connected ? "green" : "muted"}>
                    {api.connected ? "Connected" : "Not Connected"}
                  </Badge>
                </div>
                <p className="text-xs text-text-muted mt-1">{api.description}</p>
              </div>
              <a
                href={api.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-accent hover:text-accent-dim flex items-center gap-1"
              >
                Docs <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="space-y-2">
              {api.envVars.map((envVar) => (
                <div key={envVar} className="flex items-center gap-3">
                  <code className="text-xs text-text-muted bg-background px-2 py-1 rounded font-mono flex-1">
                    {envVar}
                  </code>
                  <input
                    type="password"
                    placeholder="Not configured"
                    disabled
                    className="text-xs bg-background border border-surface-border rounded px-3 py-1.5 text-text-muted w-48 cursor-not-allowed"
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-text-muted mt-3">
              Set these values in your <code className="text-accent">.env.local</code> file or Vercel dashboard.
            </p>
          </Card>
        ))}
      </div>

      {/* Theme */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <Settings className="w-4 h-4 text-text-muted" />
        </CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-primary font-medium">Dark Theme</p>
            <p className="text-xs text-text-muted">Light mode coming in a future update</p>
          </div>
          <div className="w-10 h-6 bg-accent rounded-full flex items-center px-1">
            <div className="w-4 h-4 bg-white rounded-full ml-auto" />
          </div>
        </div>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <Shield className="w-4 h-4 text-text-muted" />
        </CardHeader>
        <p className="text-sm text-text-muted">
          All API keys are stored as environment variables and never exposed to the client.
          Configure them via <code className="text-accent">.env.local</code> for local dev or through
          the Vercel dashboard for production.
        </p>
      </Card>
    </div>
  );
}
