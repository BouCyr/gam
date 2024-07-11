package app.cbo.game.space.server;

import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.SimpleFileServer;

import java.net.InetSocketAddress;
import java.nio.file.Path;

public class StartServer {



    public static final String HOST_NAME = "0.0.0.0";
    public static final int PORT = 8241;

    public static void main(String... args){
        System.out.println("IN");
        HttpServer server = SimpleFileServer.createFileServer(
                new InetSocketAddress(HOST_NAME, PORT),
                Path.of("C:\\workspace\\gam\\docs"),
                SimpleFileServer.OutputLevel.INFO);

        System.out.println("init");
        server.start();
        System.out.println("started on "+PORT);

    }
}
