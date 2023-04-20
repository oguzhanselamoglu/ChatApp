namespace ChatApp.Api.Models;

public class UserDto
{
    public UserDto(Guid id, string name, string connectionId, string password)
    {
        Id = id;
        Name = name;
        ConnectionId = connectionId;
        Password = password;
    }

    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Password { get; set; }
    public string ConnectionId { get; set; }
    
}

public class UserLoginDto
{
    public string Username { get; set; }
    public string Password { get; set; }
}

public class ConnectionDto
{
    public Guid UserId { get; set; }
    public string ConnectionId { get; set; }
    public DateTime TimeStamp { get; set; }
}