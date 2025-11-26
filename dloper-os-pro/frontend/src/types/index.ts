export interface User {
  username: string;
  email?: string;
  role?: string;
  created_at?: string;
}

export interface Website {
  name: string;
  root_path: string;
  domains: string[];
  ssl_enabled: boolean;
  upstream?: string | null;
  analytics?: {
    requests: number;
    errors: number;
    bandwidth_mb: number;
  };
}

export interface SharedFile {
  id: string;
  filename: string;
  path: string;
  password_protected: boolean;
  expires_at?: string | null;
  max_downloads?: number | null;
  download_count: number;
  share_url?: string;
  owner?: string;
   active?: boolean;
}

export interface ContainerSummary {
  id: string;
  name: string;
  image: string;
  status: string;
  cpu_percent?: number | null;
  memory_percent?: number | null;
}

export interface BackupRecord {
  name: string;
  path: string;
  size: number;
  created_at: string;
}
