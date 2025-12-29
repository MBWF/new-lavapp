import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Building2,
  Phone,
  MapPin,
  ImageIcon,
  Loader2,
  Save,
  Check,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import {
  useCompanySettings,
  useUpdateCompanySettings,
} from "@/hooks/use-company-settings";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/perfil")({
  component: PerfilPage,
});

function PerfilPage() {
  const { data: settings, isLoading } = useCompanySettings();
  const updateSettings = useUpdateCompanySettings();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings) {
      setName(settings.name || "");
      setPhone(settings.phone || "");
      setAddress(settings.address || "");
      setLogoUrl(settings.logoUrl || "");
    }
  }, [settings]);

  useEffect(() => {
    if (settings) {
      const changed =
        name !== (settings.name || "") ||
        phone !== (settings.phone || "") ||
        address !== (settings.address || "") ||
        logoUrl !== (settings.logoUrl || "");
      setHasChanges(changed);
    }
  }, [name, phone, address, logoUrl, settings]);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 11)
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateSettings.mutateAsync({
        id: settings?.id || "",
        input: {
          name: name || "LavApp",
          phone: phone || null,
          address: address || null,
          logoUrl: logoUrl || null,
        },
      });

      toast({
        title: "Configurações salvas!",
        description: "As informações da empresa foram atualizadas.",
        variant: "success",
      });
      setHasChanges(false);
    } catch {
      toast({
        title: "Erro ao salvar",
        description:
          "Não foi possível salvar as configurações. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Header
        title="Perfil da Empresa"
        description="Gerencie as informações da sua lavanderia"
      />

      <div className="flex-1 space-y-6 p-6">
        <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5" />
                Informações da Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Logo URL */}
              <div className="space-y-2">
                <Label htmlFor="logoUrl" className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  Logo (URL)
                </Label>
                <Input
                  id="logoUrl"
                  type="url"
                  placeholder="https://exemplo.com/sua-logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                />
                {logoUrl && (
                  <div className="mt-2 flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                      <img
                        src={logoUrl}
                        alt="Logo preview"
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Pré-visualização do logo
                    </span>
                  </div>
                )}
              </div>

              {/* Nome da Empresa */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  Nome da Empresa
                </Label>
                <Input
                  id="name"
                  placeholder="Nome da sua lavanderia"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Telefone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  Telefone / WhatsApp
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={phone}
                  onChange={handlePhoneChange}
                  maxLength={15}
                />
              </div>

              {/* Endereço */}
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Endereço
                </Label>
                <Textarea
                  id="address"
                  placeholder="Rua, número, bairro, cidade - UF"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!hasChanges || updateSettings.isPending}
              className="gap-2"
            >
              {updateSettings.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : hasChanges ? (
                <>
                  <Save className="h-4 w-4" />
                  Salvar Alterações
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Salvo
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
