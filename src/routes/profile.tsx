import { createFileRoute } from '@tanstack/react-router';
import { Building2, Loader2, MapPin, Phone, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { LogoUpload } from '@/components/profile/logo-upload';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useCompanySettings,
  useUpdateCompanySettings,
  useUploadLogo,
  useDeleteLogo,
} from '@/hooks/use-company-settings';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
});

function ProfilePage() {
  const { data: companySettings, isLoading } = useCompanySettings();
  const updateSettings = useUpdateCompanySettings();
  const uploadLogo = useUploadLogo();
  const deleteLogo = useDeleteLogo();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (companySettings) {
      setFormData({
        name: companySettings.name || '',
        phone: companySettings.phone || '',
        address: companySettings.address || '',
      });
    }
  }, [companySettings]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleUploadLogo = async (file: File) => {
    try {
      const logoUrl = await uploadLogo.mutateAsync(file);

      if (companySettings) {
        await updateSettings.mutateAsync({
          id: companySettings.id,
          input: { logoUrl },
        });
      }

      toast({
        title: 'Logo atualizada',
        description: 'Logo da empresa atualizada com sucesso!',
        variant: 'success',
      });
    } catch {
      toast({
        title: 'Erro ao fazer upload',
        description: 'Não foi possível fazer upload da logo. Tente novamente.',
        variant: 'destructive',
      });
      throw new Error('Upload failed');
    }
  };

  const handleRemoveLogo = async () => {
    if (!companySettings?.logoUrl) return;

    try {
      await deleteLogo.mutateAsync(companySettings.logoUrl);

      updateSettings.mutate({
        id: companySettings.id,
        input: { logoUrl: null },
      });

      toast({
        title: 'Logo removida',
        description: 'Logo da empresa removida com sucesso!',
        variant: 'success',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Erro ao remover logo',
        description: 'Não foi possível remover a logo. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companySettings) return;

    if (!formData.name.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor, informe o nome da empresa.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateSettings.mutateAsync({
        id: companySettings.id,
        input: {
          name: formData.name,
          phone: formData.phone || null,
          address: formData.address || null,
        },
      });

      setHasChanges(false);

      toast({
        title: 'Alterações salvas',
        description: 'Informações da empresa atualizadas com sucesso!',
        variant: 'success',
      });
    } catch {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as alterações. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <Header
          title="Perfil da Empresa"
          description="Gerencie as informações da sua empresa"
        />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!companySettings) {
    return (
      <div className="flex h-full flex-col">
        <Header
          title="Perfil da Empresa"
          description="Gerencie as informações da sua empresa"
        />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">
            Não foi possível carregar as configurações da empresa.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <Header
        title="Perfil da Empresa"
        description="Gerencie as informações da sua empresa"
      />

      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5" />
                  Informações da Empresa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Nome da Empresa <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Nome da empresa"
                    maxLength={100}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Telefone
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(11) 99999-9999"
                    type="tel"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Endereço
                  </Label>
                  <textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange('address', e.target.value)
                    }
                    placeholder="Rua, número, bairro, cidade, estado..."
                    rows={3}
                    className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Logo da Empresa</CardTitle>
              </CardHeader>
              <CardContent>
                <LogoUpload
                  currentLogoUrl={companySettings.logoUrl}
                  onUpload={handleUploadLogo}
                  onRemove={handleRemoveLogo}
                  isUploading={uploadLogo.isPending || deleteLogo.isPending}
                />
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="submit"
              disabled={!hasChanges || updateSettings.isPending}
              className={cn(
                'gap-2',
                !hasChanges && 'cursor-not-allowed opacity-50',
              )}
            >
              {updateSettings.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Salvar Alterações
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
