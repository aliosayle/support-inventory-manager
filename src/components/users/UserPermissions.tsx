
import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Permission } from '@/types';

interface PermissionGroup {
  title: string;
  permissions: {
    key: Permission;
    label: string;
  }[];
}

const permissionGroups: PermissionGroup[] = [
  {
    title: 'Issues',
    permissions: [
      { key: 'create_issue', label: 'Create Issues' },
      { key: 'edit_issue', label: 'Edit Issues' },
      { key: 'delete_issue', label: 'Delete Issues' },
      { key: 'assign_issue', label: 'Assign Issues' },
      { key: 'resolve_issue', label: 'Resolve Issues' },
    ],
  },
  {
    title: 'Inventory',
    permissions: [
      { key: 'create_stock', label: 'Create Stock Items' },
      { key: 'edit_stock', label: 'Edit Stock Items' },
      { key: 'delete_stock', label: 'Delete Stock Items' },
      { key: 'manage_stock_transactions', label: 'Manage Stock Transactions' },
    ],
  },
  {
    title: 'Purchase Requests',
    permissions: [
      { key: 'create_purchase_request', label: 'Create Purchase Requests' },
      { key: 'approve_purchase_request', label: 'Approve Purchase Requests' },
      { key: 'reject_purchase_request', label: 'Reject Purchase Requests' },
    ],
  },
  {
    title: 'Other',
    permissions: [
      { key: 'view_reports', label: 'View Reports' },
      { key: 'manage_users', label: 'Manage Users' },
    ],
  },
];

interface UserPermissionsProps {
  userPermissions: Permission[];
  onChange: (permissions: Permission[]) => void;
  onCancel: () => void;
  onSave: () => void;
  isLoading?: boolean;
}

const UserPermissions = ({
  userPermissions,
  onChange,
  onCancel,
  onSave,
  isLoading = false,
}: UserPermissionsProps) => {
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>(userPermissions || []);

  const handlePermissionChange = (permission: Permission, isChecked: boolean) => {
    const updatedPermissions = isChecked
      ? [...selectedPermissions, permission]
      : selectedPermissions.filter(p => p !== permission);
    
    setSelectedPermissions(updatedPermissions);
    onChange(updatedPermissions);
  };

  const handleSelectAll = (group: PermissionGroup, isChecked: boolean) => {
    const groupPermissions = group.permissions.map(p => p.key);
    let updatedPermissions: Permission[];
    
    if (isChecked) {
      // Add all permissions from this group that aren't already selected
      updatedPermissions = [
        ...selectedPermissions,
        ...groupPermissions.filter(p => !selectedPermissions.includes(p))
      ];
    } else {
      // Remove all permissions from this group
      updatedPermissions = selectedPermissions.filter(p => !groupPermissions.includes(p));
    }
    
    setSelectedPermissions(updatedPermissions);
    onChange(updatedPermissions);
  };

  const isGroupFullySelected = (group: PermissionGroup): boolean => {
    return group.permissions.every(p => selectedPermissions.includes(p.key));
  };

  const isGroupPartiallySelected = (group: PermissionGroup): boolean => {
    return !isGroupFullySelected(group) && 
           group.permissions.some(p => selectedPermissions.includes(p.key));
  };

  return (
    <div className="space-y-6">
      {permissionGroups.map((group, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id={`group-${index}`}
                checked={isGroupFullySelected(group)}
                indeterminate={isGroupPartiallySelected(group)}
                onCheckedChange={checked => handleSelectAll(group, !!checked)}
              />
              <CardTitle className="text-lg">{group.title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {group.permissions.map((permission, permIndex) => (
                <div key={permIndex} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`permission-${permission.key}`}
                    checked={selectedPermissions.includes(permission.key)}
                    onCheckedChange={checked => 
                      handlePermissionChange(permission.key, !!checked)
                    }
                  />
                  <label 
                    htmlFor={`permission-${permission.key}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {permission.label}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end space-x-2 mt-6">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={onSave} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Permissions'}
        </Button>
      </div>
    </div>
  );
};

export default UserPermissions;
