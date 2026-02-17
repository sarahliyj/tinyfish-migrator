import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
})
export class UserListComponent implements OnInit {
  @ViewChild('searchInput') searchInput: ElementRef;

  users$ = new BehaviorSubject<any[]>([]);

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    fetch('/api/users')
      .then(res => res.json())
      .then(users => this.users$.next(users));
  }

  filterUsers(term: string) {
    this.users$.value
      .filter(u => u.name.includes(term))
      .forEach(u => console.log(u));
  }
}
