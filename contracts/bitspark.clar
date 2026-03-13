;; ============================================================================
;; BitSpark - Bitcoin-Native Crowdfunding on Stacks
;; ============================================================================
;; Spark your ideas with Bitcoin funding
;; Crowdfund projects using sBTC (1:1 Bitcoin-backed tokens)
;; ============================================================================

;; ============================================================================
;; Traits
;; ============================================================================

;; SIP-010 Fungible Token trait for sBTC compatibility (testnet)
(use-trait ft-trait 'ST1NXBK3K5YYMD6FD41MVNP3JS1GABZ8TRVX023PT.sip-010-trait-ft-standard.sip-010-trait)

;; ============================================================================
;; Constants
;; ============================================================================

;; Contract owner
(define-constant CONTRACT_OWNER tx-sender)

;; Platform fee: 2% (200 basis points out of 10000)
(define-constant PLATFORM_FEE u200)
(define-constant FEE_DENOMINATOR u10000)

;; Error codes
(define-constant ERR_OWNER_ONLY (err u100))
(define-constant ERR_NOT_CAMPAIGN_OWNER (err u101))
(define-constant ERR_CAMPAIGN_NOT_FOUND (err u102))
(define-constant ERR_CAMPAIGN_ENDED (err u103))
(define-constant ERR_CAMPAIGN_ACTIVE (err u104))
(define-constant ERR_GOAL_NOT_REACHED (err u105))
(define-constant ERR_ALREADY_CLAIMED (err u106))
(define-constant ERR_NO_CONTRIBUTION (err u107))
(define-constant ERR_INVALID_AMOUNT (err u108))
(define-constant ERR_CAMPAIGN_FAILED (err u109))
(define-constant ERR_TRANSFER_FAILED (err u110))
(define-constant ERR_REFUNDS_NOT_ENABLED (err u111))
(define-constant ERR_GOAL_REACHED (err u112))

;; ============================================================================
;; Data Variables
;; ============================================================================

;; Campaign counter (auto-incrementing ID)
(define-data-var campaign-nonce uint u0)

;; Platform statistics
(define-data-var total-campaigns uint u0)
(define-data-var successful-campaigns uint u0)
(define-data-var total-raised uint u0)

;; Treasury for platform fees
(define-data-var fee-treasury principal CONTRACT_OWNER)

;; ============================================================================
;; Data Maps
;; ============================================================================

;; Campaign data structure
(define-map campaigns uint {
    owner: principal,
    title: (string-utf8 128),
    description: (string-utf8 512),
    goal: uint,                    ;; Target amount in sats (sBTC smallest unit)
    raised: uint,                  ;; Amount raised so far
    contributors-count: uint,      ;; Number of unique backers
    start-block: uint,             ;; Block when campaign started
    end-block: uint,               ;; Block when campaign ends
    claimed: bool,                 ;; Has creator claimed funds?
    refunds-enabled: bool          ;; Are refunds enabled (only if failed)?
})

;; Track contributions per campaign per user
(define-map contributions { campaign-id: uint, contributor: principal } uint)

;; Creator reputation/stats
(define-map creator-stats principal {
    campaigns-created: uint,
    campaigns-successful: uint,
    total-raised: uint
})

;; Backer reputation/stats
(define-map backer-stats principal {
    campaigns-backed: uint,
    total-contributed: uint
})

;; ============================================================================
;; Private Functions
;; ============================================================================

;; Calculate platform fee for an amount
(define-private (calculate-fee (amount uint))
    (/ (* amount PLATFORM_FEE) FEE_DENOMINATOR)
)

;; ============================================================================
;; Read-Only Functions
;; ============================================================================

;; Get campaign details
(define-read-only (get-campaign (campaign-id uint))
    (map-get? campaigns campaign-id)
)

;; Get user's contribution to a specific campaign
(define-read-only (get-contribution (campaign-id uint) (contributor principal))
    (default-to u0 
        (map-get? contributions { campaign-id: campaign-id, contributor: contributor })
    )
)

;; Get creator stats
(define-read-only (get-creator-stats (creator principal))
    (default-to 
        { campaigns-created: u0, campaigns-successful: u0, total-raised: u0 }
        (map-get? creator-stats creator)
    )
)

;; Get backer stats  
(define-read-only (get-backer-stats (backer principal))
    (default-to 
        { campaigns-backed: u0, total-contributed: u0 }
        (map-get? backer-stats backer)
    )
)

;; Get platform stats
(define-read-only (get-platform-stats)
    {
        total-campaigns: (var-get total-campaigns),
        successful-campaigns: (var-get successful-campaigns),
        total-raised: (var-get total-raised)
    }
)

;; Check if campaign is still active (accepting contributions)
(define-read-only (is-campaign-active (campaign-id uint))
    (match (map-get? campaigns campaign-id)
        campaign (and 
            (<= stacks-block-height (get end-block campaign)) 
            (not (get claimed campaign))
        )
        false
    )
)

;; Check if campaign met its goal
(define-read-only (is-campaign-successful (campaign-id uint))
    (match (map-get? campaigns campaign-id)
        campaign (>= (get raised campaign) (get goal campaign))
        false
    )
)

;; Get fee calculation (public read)
(define-read-only (get-fee-amount (amount uint))
    (calculate-fee amount)
)

;; Get funding progress as percentage (0-100+)
(define-read-only (get-progress-percentage (campaign-id uint))
    (match (map-get? campaigns campaign-id)
        campaign 
            (if (> (get goal campaign) u0)
                (/ (* (get raised campaign) u100) (get goal campaign))
                u0
            )
        u0
    )
)

;; Get time remaining in blocks
(define-read-only (get-time-remaining (campaign-id uint))
    (match (map-get? campaigns campaign-id)
        campaign 
            (if (> (get end-block campaign) stacks-block-height)
                (- (get end-block campaign) stacks-block-height)
                u0
            )
        u0
    )
)

;; ============================================================================
;; Public Functions - Campaign Management
;; ============================================================================

;; Create a new crowdfunding campaign
;; @param title - Campaign title (max 128 UTF-8 chars)
;; @param description - Campaign description (max 512 UTF-8 chars)
;; @param goal - Funding goal in satoshis (sBTC smallest unit)
;; @param duration - Campaign duration in blocks (~10 min/block, so 4320 = ~30 days)
(define-public (create-campaign 
    (title (string-utf8 128)) 
    (description (string-utf8 512)) 
    (goal uint) 
    (duration uint))
    (let (
        (campaign-id (var-get campaign-nonce))
    )
        ;; Validate inputs
        (asserts! (> goal u0) ERR_INVALID_AMOUNT)
        (asserts! (> duration u0) ERR_INVALID_AMOUNT)
        
        ;; Create campaign
        (map-set campaigns campaign-id {
            owner: tx-sender,
            title: title,
            description: description,
            goal: goal,
            raised: u0,
            contributors-count: u0,
            start-block: stacks-block-height,
            end-block: (+ stacks-block-height duration),
            claimed: false,
            refunds-enabled: false
        })
        
        ;; Update global nonce and stats
        (var-set campaign-nonce (+ campaign-id u1))
        (var-set total-campaigns (+ (var-get total-campaigns) u1))
        
        ;; Update creator stats
        (let ((stats (get-creator-stats tx-sender)))
            (map-set creator-stats tx-sender 
                (merge stats { campaigns-created: (+ (get campaigns-created stats) u1) })
            )
        )
        
        ;; Return campaign info
        (ok { 
            campaign-id: campaign-id, 
            end-block: (+ stacks-block-height duration) 
        })
    )
)

;; ============================================================================
;; Public Functions - Contributions (using trait for token flexibility)
;; ============================================================================

;; Contribute sBTC to a campaign
;; @param campaign-id - ID of the campaign to back
;; @param amount - Amount of sBTC (in satoshis) to contribute
;; @param token - The sBTC token contract
(define-public (contribute (campaign-id uint) (amount uint) (token <ft-trait>))
    (match (map-get? campaigns campaign-id)
        campaign
        (let (
            (current-contribution (get-contribution campaign-id tx-sender))
            (is-new-contributor (is-eq current-contribution u0))
            (contributor tx-sender)
        )
            ;; Validate
            (asserts! (> amount u0) ERR_INVALID_AMOUNT)
            (asserts! (<= stacks-block-height (get end-block campaign)) ERR_CAMPAIGN_ENDED)
            (asserts! (not (get claimed campaign)) ERR_ALREADY_CLAIMED)
            
            ;; Transfer sBTC from contributor to campaign owner (escrow in their wallet)
            ;; Note: Campaign owner receives funds directly; contract tracks accounting
            (try! (contract-call? token transfer 
                amount 
                contributor 
                (get owner campaign)
                none
            ))
            
            ;; Update campaign
            (map-set campaigns campaign-id 
                (merge campaign {
                    raised: (+ (get raised campaign) amount),
                    contributors-count: (if is-new-contributor
                        (+ (get contributors-count campaign) u1)
                        (get contributors-count campaign)
                    )
                })
            )
            
            ;; Update contribution record
            (map-set contributions 
                { campaign-id: campaign-id, contributor: contributor }
                (+ current-contribution amount)
            )
            
            ;; Update backer stats
            (let ((stats (get-backer-stats contributor)))
                (map-set backer-stats contributor 
                    (merge stats {
                        campaigns-backed: (if is-new-contributor
                            (+ (get campaigns-backed stats) u1)
                            (get campaigns-backed stats)
                        ),
                        total-contributed: (+ (get total-contributed stats) amount)
                    })
                )
            )
            
            ;; Return contribution info
            (ok { 
                campaign-id: campaign-id, 
                contributed: amount, 
                total: (+ current-contribution amount) 
            })
        )
        ERR_CAMPAIGN_NOT_FOUND
    )
)

;; ============================================================================
;; Public Functions - Campaign Completion
;; ============================================================================

;; Mark campaign as successfully claimed (owner only, after goal reached)
;; Note: Funds already with owner; this updates stats and prevents double-counting
;; @param campaign-id - ID of the campaign
(define-public (finalize-successful-campaign (campaign-id uint))
    (match (map-get? campaigns campaign-id)
        campaign
        (let (
            (raised (get raised campaign))
        )
            ;; Validate
            (asserts! (is-eq (get owner campaign) tx-sender) ERR_NOT_CAMPAIGN_OWNER)
            (asserts! (> stacks-block-height (get end-block campaign)) ERR_CAMPAIGN_ACTIVE)
            (asserts! (>= raised (get goal campaign)) ERR_GOAL_NOT_REACHED)
            (asserts! (not (get claimed campaign)) ERR_ALREADY_CLAIMED)
            
            ;; Mark as claimed
            (map-set campaigns campaign-id 
                (merge campaign { claimed: true })
            )
            
            ;; Update global stats
            (var-set total-raised (+ (var-get total-raised) raised))
            (var-set successful-campaigns (+ (var-get successful-campaigns) u1))
            
            ;; Update creator stats
            (let ((stats (get-creator-stats tx-sender)))
                (map-set creator-stats tx-sender 
                    (merge stats {
                        campaigns-successful: (+ (get campaigns-successful stats) u1),
                        total-raised: (+ (get total-raised stats) raised)
                    })
                )
            )
            
            ;; Return success info
            (ok { 
                campaign-id: campaign-id, 
                raised: raised,
                success: true
            })
        )
        ERR_CAMPAIGN_NOT_FOUND
    )
)

;; Enable refunds for a failed campaign (campaign owner only)
;; @param campaign-id - ID of the campaign
(define-public (enable-refunds (campaign-id uint))
    (match (map-get? campaigns campaign-id)
        campaign
        (begin
            ;; Validate
            (asserts! (is-eq (get owner campaign) tx-sender) ERR_NOT_CAMPAIGN_OWNER)
            (asserts! (> stacks-block-height (get end-block campaign)) ERR_CAMPAIGN_ACTIVE)
            (asserts! (< (get raised campaign) (get goal campaign)) ERR_GOAL_REACHED)
            (asserts! (not (get claimed campaign)) ERR_ALREADY_CLAIMED)
            
            ;; Enable refunds
            (map-set campaigns campaign-id 
                (merge campaign { refunds-enabled: true })
            )
            
            (ok { campaign-id: campaign-id, refunds-enabled: true })
        )
        ERR_CAMPAIGN_NOT_FOUND
    )
)

;; Process refund (campaign owner sends back sBTC to contributor)
;; This is called BY THE CAMPAIGN OWNER to refund a specific contributor
;; @param campaign-id - ID of the campaign
;; @param contributor - Address of contributor to refund
;; @param token - The sBTC token contract
(define-public (process-refund (campaign-id uint) (backer principal) (token <ft-trait>))
    (match (map-get? campaigns campaign-id)
        campaign
        (let (
            (contribution (get-contribution campaign-id backer))
            (campaign-owner (get owner campaign))
        )
            ;; Validate - must be campaign owner processing refund
            (asserts! (is-eq campaign-owner tx-sender) ERR_NOT_CAMPAIGN_OWNER)
            (asserts! (> contribution u0) ERR_NO_CONTRIBUTION)
            (asserts! (> stacks-block-height (get end-block campaign)) ERR_CAMPAIGN_ACTIVE)
            (asserts! (< (get raised campaign) (get goal campaign)) ERR_GOAL_REACHED)
            (asserts! (get refunds-enabled campaign) ERR_REFUNDS_NOT_ENABLED)
            
            ;; Clear contribution record
            (map-set contributions 
                { campaign-id: campaign-id, contributor: backer } 
                u0
            )
            
            ;; Update campaign raised amount
            (map-set campaigns campaign-id 
                (merge campaign {
                    raised: (- (get raised campaign) contribution)
                })
            )
            
            ;; Campaign owner transfers sBTC back to contributor
            (try! (contract-call? token transfer 
                contribution 
                campaign-owner    ;; from: campaign owner (caller)
                backer            ;; to: the contributor being refunded
                none
            ))
            
            ;; Return refund info
            (ok { 
                campaign-id: campaign-id, 
                backer: backer,
                refunded: contribution 
            })
        )
        ERR_CAMPAIGN_NOT_FOUND
    )
)

;; ============================================================================
;; Public Functions - Campaign Updates
;; ============================================================================

;; Extend campaign deadline (owner only, while still active)
;; @param campaign-id - ID of the campaign
;; @param additional-blocks - Number of blocks to extend
(define-public (extend-deadline (campaign-id uint) (additional-blocks uint))
    (match (map-get? campaigns campaign-id)
        campaign
        (begin
            ;; Validate
            (asserts! (is-eq (get owner campaign) tx-sender) ERR_NOT_CAMPAIGN_OWNER)
            (asserts! (<= stacks-block-height (get end-block campaign)) ERR_CAMPAIGN_ENDED)
            (asserts! (> additional-blocks u0) ERR_INVALID_AMOUNT)
            
            ;; Extend deadline
            (map-set campaigns campaign-id 
                (merge campaign {
                    end-block: (+ (get end-block campaign) additional-blocks)
                })
            )
            
            (ok { 
                campaign-id: campaign-id, 
                new-end-block: (+ (get end-block campaign) additional-blocks) 
            })
        )
        ERR_CAMPAIGN_NOT_FOUND
    )
)

;; Update campaign description (owner only)
;; @param campaign-id - ID of the campaign
;; @param new-description - New description text
(define-public (update-description (campaign-id uint) (new-description (string-utf8 512)))
    (match (map-get? campaigns campaign-id)
        campaign
        (begin
            ;; Validate
            (asserts! (is-eq (get owner campaign) tx-sender) ERR_NOT_CAMPAIGN_OWNER)
            
            ;; Update description
            (map-set campaigns campaign-id 
                (merge campaign { description: new-description })
            )
            
            (ok true)
        )
        ERR_CAMPAIGN_NOT_FOUND
    )
)

;; ============================================================================
;; Admin Functions
;; ============================================================================

;; Update fee treasury address (contract owner only)
(define-public (set-fee-treasury (new-treasury principal))
    (begin
        (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
        (var-set fee-treasury new-treasury)
        (ok true)
    )
)

;; Get current fee treasury
(define-read-only (get-fee-treasury)
    (var-get fee-treasury)
)
