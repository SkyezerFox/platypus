extern crate clap;
extern crate log;
extern crate pretty_env_logger;
extern crate tokio;

use cbor::{Cbor, Decoder};
use futures_util::stream::StreamExt;
use std::process;

use clap::Clap;
use log::{debug, error, LevelFilter};
use tokio_tungstenite::connect_async;

use crate::socket::Socket;

mod socket;

#[derive(Clap)]
#[clap(
    version = "0.0.0",
    author = "skyezerfox (Skye) <actuallyori@gmail.com>"
)]
struct Opts {
    #[clap(long, default_value = "wss://gateway.platypus.ai")]
    gateway: String,
    #[clap(short, long)]
    debug: bool,
    #[clap(long)]
    trace: bool,
}

#[tokio::main]
async fn main() {
    let opts: Opts = Opts::parse();
    // print splash
    println!("\nplatypus-daemon v{}", env!("CARGO_PKG_VERSION"));
    println!("(c) skyezerfox (Skye) and contributors\n");
    // setup level filter
    let mut filter_level = LevelFilter::Info;
    if opts.debug {
        filter_level = LevelFilter::Debug;
    }
    if opts.trace {
        filter_level = LevelFilter::Trace;
    }
    // setup logger
    pretty_env_logger::formatted_builder()
        .filter_level(filter_level)
        .init();
    debug!("gateway_uri = '{}'", opts.gateway);

    let connection = match connect_async(opts.gateway).await {
        Ok(conn) => conn,
        Err(err) => {
            error!("error while connecting to gateway: {}", err);
            process::exit(1);
        }
    };
    let (ws_stream, _) = connection;
    let (tx, rx) = ws_stream.split();

    Socket::new(tx, rx).handle_messages().await;
}
