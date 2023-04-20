import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr'
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';



export class User {
  public id!: string;
  public name: string | undefined;
  public connectionId!: string;//signalr
  public msgs!: Array<Message>;
}



export class Message {
  constructor(
    public content: string,
    public mine: boolean
  ) { }
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  hubConnection!: signalR.HubConnection;
  userData!: User;
  ssSubj = new Subject<any>();
  ssObs(): Observable<any> {
    return this.ssSubj.asObservable();
  }
  constructor(public toastr: ToastrService, public router: Router) { }


  startConnection(): void {
    const address = environment.hubUrl;
    this.hubConnection = new signalR.HubConnectionBuilder()
      .configureLogging(signalR.LogLevel.Debug) //loglama için
      .withAutomaticReconnect()
      .withUrl(address, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .build();

    this.hubConnection
      .start()
      .then(() => {
        // this.hubAddGroup();
        this.ssSubj.next({ type: "HubConnStarted" });

      })
      .catch((err) => {
        setTimeout(() => {
          this.startConnection();
        }, 2000);
      });
  }
  async askServer() {
    await this.hubConnection.invoke('askServer', 'hey')
      .then(() => {
        console.log("askServer.then");
      })
      .catch(err => console.error(err));
  }
  askServerListener() {
    this.hubConnection.on('askServerResponse', (someText) => {
      console.log(someText);
      this.toastr.success(someText);
    })
  }
}
