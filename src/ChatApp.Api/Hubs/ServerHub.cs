using System;
using ChatApp.Api.Models;
using Microsoft.AspNetCore.SignalR;

namespace ChatApp.Api.Hubs
{
    public class ServerHub : Hub
    {
        public static List<UserDto> Users = new List<UserDto>
        {
            new UserDto(Guid.NewGuid(), "oguzhan", "", "123"),
            new UserDto(Guid.NewGuid(), "burak", "", "123"),
            new UserDto(Guid.NewGuid(), "ali", "", "123")
        };

        public static List<ConnectionDto> Connections = new();

        public override Task OnDisconnectedAsync(Exception? exception)
        {
            return base.OnDisconnectedAsync(exception);
        }

        public async Task LoginAsync(UserLoginDto userLogin)
        {
            string currSignalrID = Context.ConnectionId;
            var user = Users.FirstOrDefault(x => x.Name == userLogin.Username && x.Password == userLogin.Password);
            if (user == null)
            {
                await Clients.Caller.SendAsync("loginfaild");
                return;
            }

            Connections.Add(new ConnectionDto
            {
                UserId = user.Id,
                ConnectionId = currSignalrID,
                TimeStamp = DateTime.Now
            });

            user.ConnectionId = currSignalrID;
            await Clients.Caller.SendAsync("LoginSuccess", user);
            await Clients.Others.SendAsync("userOn", user);
        }

        public async Task Relogin(Guid personId)
        {
            string currSignalrID = Context.ConnectionId;
            var user = Users.FirstOrDefault(x => x.Id == personId);
            if (user == null)
            {
                await Clients.Caller.SendAsync("loginfaild");
                return;
            }


            Console.WriteLine("\n" + user.Name + " logged in" + "\nSignalrID: " + currSignalrID);

            Connections.Add(new ConnectionDto
            {
                UserId = user.Id,
                ConnectionId = currSignalrID,
                TimeStamp = DateTime.Now
            });

            user.ConnectionId = currSignalrID;
            await Clients.Caller.SendAsync("ReLoginResponse", user); //4Tutorial
            await Clients.Others.SendAsync("userOn", user); //4Tutorial
        } 

        public void LogOut(Guid personId)
        {
            Connections.RemoveAll(x => x.UserId == personId);
            Clients.Caller.SendAsync("logoutResponse");
            Clients.Others.SendAsync("userOff", personId);
        }

        public async Task askServer(string someTextFromClient)
        {
            string tempString;
            if (someTextFromClient == "hey")
            {
                tempString = "message was hey";
            }
            else
            {
                tempString = "message was something else";
            }

            await Clients.Client(this.Context.ConnectionId).SendAsync("askServerResponse", tempString);
        }


        public async Task GetOnlineUser()
        {
            Guid currUserId = Connections.Where(c => c.ConnectionId == Context.ConnectionId).Select(c => c.UserId)
                .SingleOrDefault();
            List<UserDto> onlineUsers = Connections
                .Where(c => c.UserId != currUserId)
                .Select(c =>
                    new UserDto(c.UserId, Users.Where(p => p.Id == c.UserId).Select(p => p.Name).SingleOrDefault(),
                        c.ConnectionId, "")
                ).ToList();
            await Clients.Caller.SendAsync("getOnlineUsersResponse", onlineUsers);
        }


        public async Task SendMessage(string connId, string msg)
        {
            await Clients.Client(connId).SendAsync("SendMessageResponse", Context.ConnectionId, msg);
        }
    }
}