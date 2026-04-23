package com.hazdik.kasirtoko.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "suppliers")
@Getter
@Setter
@NoArgsConstructor
public class Supplier extends BaseEntity {

  @Column(nullable = false)
  private String companyName;

  @Column(nullable = false)
  private String senderName;

  @Column(nullable = false)
  private String phoneNumber;
}
