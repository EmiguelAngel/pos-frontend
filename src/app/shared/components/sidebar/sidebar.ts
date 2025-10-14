// src/app/shared/components/sidebar/sidebar.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { ROUTES, ROLES } from '../../../core/constants/app.constants';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles: number[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent implements OnInit {
  menuItems: MenuItem[] = [
    // Admin Menu
    {
      label: 'Dashboard',
      icon: 'layout-dashboard',
      route: ROUTES.ADMIN.DASHBOARD,
      roles: [ROLES.ADMIN]
    },
    {
      label: 'Productos',
      icon: 'package',
      route: ROUTES.ADMIN.PRODUCTS,
      roles: [ROLES.ADMIN]
    },
    {
      label: 'Usuarios',
      icon: 'users',
      route: ROUTES.ADMIN.USERS,
      roles: [ROLES.ADMIN]
    },
    {
      label: 'Reportes',
      icon: 'chart-bar',
      route: ROUTES.ADMIN.REPORTS,
      roles: [ROLES.ADMIN]
    },
    // Cajero Menu
    {
      label: 'Punto de Venta',
      icon: 'shopping-cart',
      route: ROUTES.CAJERO.POS,
      roles: [ROLES.CAJERO]
    },
    {
      label: 'Historial',
      icon: 'clock',
      route: ROUTES.CAJERO.HISTORY,
      roles: [ROLES.CAJERO]
    }
  ];

  filteredMenuItems: MenuItem[] = [];
  isCollapsed = false;

  constructor(
    private authService: AuthService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.filterMenuByRole();
  }

  /**
   * Filtrar menú según el rol del usuario
   */
  filterMenuByRole(): void {
    const userRole = this.authService.getUserRole();
    if (userRole) {
      this.filteredMenuItems = this.menuItems.filter(item =>
        item.roles.includes(userRole)
      );
    }
  }

  /**
   * Toggle sidebar colapsado/expandido
   */
  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  /**
   * Obtener SVG del ícono
   */
  getIconSvg(iconName: string): string {
    const icons: { [key: string]: string } = {
      'layout-dashboard': '<path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z"/>',
      'package': '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line>',
      'users': '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>',
      'chart-bar': '<line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line>',
      'shopping-cart': '<circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>',
      'clock': '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>'
    };
    return icons[iconName] || '';
  }
}
