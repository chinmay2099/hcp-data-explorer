import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";

interface TenantSelectorProps {
  currentTenant: string;
  availableTenants: string[];
  onTenantChange: (tenant: string) => void;
}

export function TenantSelector({
  currentTenant,
  availableTenants,
  onTenantChange,
}: TenantSelectorProps) {
  return (
    <FormControl size="small" sx={{ minWidth: 150 }}>
      <InputLabel>Tenant</InputLabel>
      <Select
        value={currentTenant}
        label="Tenant"
        onChange={(e) => onTenantChange(e.target.value)}
      >
        {availableTenants.map((tenant) => (
          <MenuItem key={tenant} value={tenant}>
            {tenant.charAt(0).toUpperCase() + tenant.slice(1)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}