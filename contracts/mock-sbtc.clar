;; ============================================================================
;; Mock sBTC Token for Testing
;; ============================================================================
;; A simple SIP-010 compliant token for unit testing the BitSpark contract
;; This allows minting tokens to test wallets without needing real sBTC
;; ============================================================================

(impl-trait 'ST1NXBK3K5YYMD6FD41MVNP3JS1GABZ8TRVX023PT.sip-010-trait-ft-standard.sip-010-trait)

;; Token definitions
(define-fungible-token mock-sbtc)

;; Token metadata
(define-constant TOKEN_NAME "Mock sBTC")
(define-constant TOKEN_SYMBOL "msBTC")
(define-constant TOKEN_DECIMALS u8)

;; Error codes
(define-constant ERR_NOT_AUTHORIZED (err u1))
(define-constant ERR_INSUFFICIENT_BALANCE (err u2))

;; Contract owner (can mint)
(define-constant CONTRACT_OWNER tx-sender)

;; ============================================================================
;; SIP-010 Required Functions
;; ============================================================================

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
    (begin
        (asserts! (is-eq tx-sender sender) ERR_NOT_AUTHORIZED)
        (try! (ft-transfer? mock-sbtc amount sender recipient))
        (match memo to-print (print to-print) 0x)
        (ok true)
    )
)

(define-read-only (get-name)
    (ok TOKEN_NAME)
)

(define-read-only (get-symbol)
    (ok TOKEN_SYMBOL)
)

(define-read-only (get-decimals)
    (ok TOKEN_DECIMALS)
)

(define-read-only (get-balance (account principal))
    (ok (ft-get-balance mock-sbtc account))
)

(define-read-only (get-total-supply)
    (ok (ft-get-supply mock-sbtc))
)

(define-read-only (get-token-uri)
    (ok (some u"https://bitspark.io/mock-sbtc.json"))
)

;; ============================================================================
;; Mint Function (for testing only)
;; ============================================================================

;; Anyone can mint tokens in this mock contract (for testing purposes)
(define-public (mint (amount uint) (recipient principal))
    (ft-mint? mock-sbtc amount recipient)
)

;; Burn function
(define-public (burn (amount uint) (owner principal))
    (begin
        (asserts! (is-eq tx-sender owner) ERR_NOT_AUTHORIZED)
        (ft-burn? mock-sbtc amount owner)
    )
)
