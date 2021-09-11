use cbor::{Cbor, Decoder, Encoder};
use futures_util::{SinkExt, stream::{SplitSink, SplitStream, StreamExt}};
use  std::error::Error;
use rustc_serialize::Encodable;
use tokio::net::TcpStream;
use tokio_tungstenite::{tungstenite::Message, MaybeTlsStream, WebSocketStream};

type TX = SplitSink<WebSocketStream<MaybeTlsStream<TcpStream>>, Message>;
type RX = SplitStream<WebSocketStream<MaybeTlsStream<TcpStream>>>;

pub struct Socket {
    tx: TX,
    rx: RX,
}

enum Packet {
	HELLO {},
	IDENTIFY {}
}

impl Socket {
    pub fn new(tx: TX, rx: RX) -> Self {
        Socket { tx, rx }
    }
	
	/// Send a packet of type `T` to the gateway.
	async fn send_packet<T: Encodable>(&mut self, item: T) -> Result<(), Box<dyn Error>> {
		let mut e = Encoder::from_memory();
		e.encode(vec![item])?;
		self.tx.send(Message::binary( e.as_bytes())).await?;
		Ok(())
	}


    fn handle_packet() {}

    async fn decode_msg(&self, msg: Message) {
        let mut decoder = Decoder::from_bytes(msg.into_data());
        let msg = decoder.items().next().unwrap().unwrap();
        match msg {
            Cbor::Map(map) => {
                if let Cbor::Unsigned(id) = map.get("op").unwrap() {
                    let id = id.into_u64();
                    match id {
						0 => self.send_packet(Packet::IDENTIFY {}).await,
                        _ => panic!("unknown opcode"),
                    }
                } else {
                    println!("missing id field on message");
                }
            }
            _ => panic!("unexpected packet {:?}", msg),
        }
    }

    pub async fn handle_messages(&mut self) {
        while let Some(msg) = self.rx.next().await {
            match msg {
                Ok(msg) => self.decode_msg(msg),
                Err(_) => {
                    println!("Error");
                }
            }
        }
    }
}
