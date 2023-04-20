import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChatService, Message, User } from '../chat.service';
import { HubConnectionState } from '@microsoft/signalr';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  users: Array<User> = new Array<User>();
  selectedUser!: User;
  msg: string ='';
  constructor(public _chat: ChatService) {


  }
  ngOnInit(): void {
    this.userOnLis();
    this.userOffLis();
    this.logOutLis();
    this.getOnlineUsersLis();
this.sendMsgLis();
    if (this._chat.hubConnection.state === HubConnectionState.Connected) this.getOnlineUsersInv();
    else {
      this._chat.ssSubj.subscribe((obj: any) => {
        if (obj.type == "HubConnStarted") {
          this.getOnlineUsersInv();
        }
      });
    }
  }
  ngOnDestroy(): void {

  }

  sendMessage(): void {
    if (this.msg?.trim() === "" || this.msg == null) return;

    this._chat.hubConnection.invoke("SendMessage", this.selectedUser.connectionId, this.msg)
    .catch(err => console.error(err));

    if (this.selectedUser.msgs == null) this.selectedUser.msgs = [];
    this.selectedUser.msgs.push(new Message(this.msg, true));
    this.msg = "";
  }

  private sendMsgLis(): void {
    this._chat.hubConnection.on("SendMessageResponse", (connId: string, msg: string) => {
      let receiver = this.users.find(u => u.connectionId === connId);
      if (receiver!.msgs == null) {
        receiver!.msgs = [];
      }
      receiver?.msgs.push(new Message(msg, false));
    });
  }


  userOnLis(): void {
    this._chat.hubConnection.on("userOn", (newUser: User) => {
      console.log(newUser);
      this.users.push(newUser);
    });
  }

  logOut(): void {
    this._chat.hubConnection.invoke("logOut", this._chat.userData.id)
    .catch(err => console.error(err));
  }
  logOutLis(): void {
    this._chat.hubConnection.on("logoutResponse", () => {
      localStorage.removeItem("personId");
      location.reload();
      // this._chat.hubConnection.stop();
    });
  }

  userOffLis(): void {
    this._chat.hubConnection.on("userOff", (personId: string) => {
      this.users = this.users.filter(u => u.id != personId);
    });
  }



  getOnlineUsersInv(): void {
    this._chat.hubConnection.invoke("GetOnlineUser")
    .catch(err => console.error(err));
  }
  private getOnlineUsersLis(): void {
    this._chat.hubConnection.on("getOnlineUsersResponse", (onlineUsers: Array<User>) => {
      this.users = [...onlineUsers];
      console.log(this.users);
    });
  }
}
