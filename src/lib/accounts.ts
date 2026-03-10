export interface System {
  id: string;
  name: string;
  icon: string;
  url: string;
  type: string;
}

export interface Account {
  id: string;
  name: string;
  environment: string;
  systems: System[];
  systemColor: string;
  systemIcon: any;
  systemUrl: string;
}

export const mockAccounts: Account[] = [];
