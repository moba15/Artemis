import { Component, Input } from '@angular/core';
import { SidebarCardElement, SidebarTypes } from 'app/types/sidebar';
import { SidebarEventService } from '../sidebar-event.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
@Component({
    selector: 'jhi-small-sidebar-card',
    templateUrl: './sidebar-card-small.component.html',
    styleUrls: ['./sidebar-card-small.component.scss'],
})
export class SidebarCardSmallComponent {
    @Input({ required: true }) sidebarItem: SidebarCardElement;
    @Input() sidebarType?: SidebarTypes;
    @Input() itemSelected?: boolean;

    constructor(
        private sidebarEventService: SidebarEventService,
        private router: Router,
        private route: ActivatedRoute,
        private location: Location,
    ) {}

    emitStoreAndRefresh(itemId: number | string) {
        this.sidebarEventService.emitSidebarCardEvent(itemId);
        this.refreshChildComponent();
    }

    refreshChildComponent(): void {
        this.router.navigate(['../'], { skipLocationChange: true, relativeTo: this.route.firstChild }).then(() => {
            this.itemSelected
                ? this.router.navigate(['./' + this.sidebarItem?.id], { relativeTo: this.route })
                : this.router.navigate([this.location.path(), this.sidebarItem?.id], { replaceUrl: true });
        });
    }
}
