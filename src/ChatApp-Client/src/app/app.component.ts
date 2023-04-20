import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChatService } from './chat.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit,OnDestroy {

  constructor(private _chat: ChatService) {


  }
  ngOnDestroy(): void {
    this._chat.hubConnection.off('askServerResponse');
  }
  ngOnInit(): void {
    this._chat.startConnection();

  }
  title = 'ChatApp-Client';
}
